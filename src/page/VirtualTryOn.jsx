import React, { useRef, useEffect } from 'react';
import "./VirtualTryOnPage.css";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils
} from '@mediapipe/tasks-vision';

export default function VirtualTryOnPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const aoDaiImage = useRef(null);

  const BODY_LANDMARK_INDEXES = [
    0, 11, 12, 13, 14, 15, 16, // đầu, vai, tay
    23, 24, 25, 26, 27, 28     // hông, chân
  ];

  useEffect(() => {
    // Load áo dài
    aoDaiImage.current = new Image();
    aoDaiImage.current.src = '/aodai.png'; // Ảnh nằm trong thư mục public/

    async function initPose() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });

      poseRef.current = poseLandmarker;
      startVideo();
    }

    function startVideo() {
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(stream => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            requestAnimationFrame(runPose);
          })
          .catch(console.error);
      }
    }

    async function runPose() {
      const video = videoRef.current;
      const poseLandmarker = poseRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (poseLandmarker && video.readyState >= 2) {
        const results = await poseLandmarker.detectForVideo(video, performance.now());
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Ví dụ: lấy vai trái (11) và vai phải (12)
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];

          if (leftShoulder && rightShoulder) {
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            
            const x = leftShoulder.x * canvas.width;
            const y = leftShoulder.y * canvas.height;
            const width = (rightShoulder.x - leftShoulder.x) * canvas.width;
            const height = (leftHip.y - leftShoulder.y) * canvas.height;
            
            ctx.drawImage(aoDaiImage.current, x, y, width, height);
            
          }

          // (Optional) Vẽ landmarks để kiểm tra
          const drawingUtils = new DrawingUtils(ctx);
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#00FF00', lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', radius: 3 });
        }

        ctx.restore();
      }

      requestAnimationFrame(runPose);
    }

    initPose();

    return () => {
      if (poseRef.current) poseRef.current.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="tryon-container">
  <h2>Virtual Try-On with Áo Dài</h2>
  <video ref={videoRef} className="tryon-video" />
  <canvas ref={canvasRef} className="tryon-canvas" />
</div>

  
  );
}
