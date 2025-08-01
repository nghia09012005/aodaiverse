import React, { useState, useRef, useEffect } from 'react';

import "./VirtualTryOn.css";
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

  const [measurements, setMeasurements] = useState({
    shoulderWidth: 0,
    torsoLength: 0,
    upperBodyLength: 0,
    armLength: 0
  });

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

          // Kiểm tra xem có đủ landmarks không
          if (landmarks.length >= 33) {
            const pixel = (p) => ({
              x: p.x * canvas.width,
              y: p.y * canvas.height
            });

            // Lấy các điểm landmarks cần thiết
            const nose = pixel(landmarks[0]);
            const leftShoulder = pixel(landmarks[11]);
            const rightShoulder = pixel(landmarks[12]);
            const leftElbow = pixel(landmarks[13]);
            const rightElbow = pixel(landmarks[14]);
            const leftWrist = pixel(landmarks[15]);
            const rightWrist = pixel(landmarks[16]);
            const leftHip = pixel(landmarks[23]);
            const rightHip = pixel(landmarks[24]);

            // Tính toán các số đo
            const shoulderWidth = Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y);
            const torsoLength = Math.hypot(leftHip.x - leftShoulder.x, leftHip.y - leftShoulder.y);
            const upperBodyLength = Math.hypot(leftHip.x - nose.x, leftHip.y - nose.y);
            
            // Tính chiều dài tay trái (từ vai đến củi tay + từ củi tay đến cổ tay)
            const upperArmLength = Math.hypot(leftElbow.x - leftShoulder.x, leftElbow.y - leftShoulder.y);
            const forearmLength = Math.hypot(leftWrist.x - leftElbow.x, leftWrist.y - leftElbow.y);
            const armLength = upperArmLength + forearmLength;

            // Cập nhật state với số đo mới (chỉ cập nhật khi có thay đổi đáng kể)
            setMeasurements(prev => {
              const newMeasurements = {
                shoulderWidth: Math.round(shoulderWidth * 100) / 100,
                torsoLength: Math.round(torsoLength * 100) / 100,
                upperBodyLength: Math.round(upperBodyLength * 100) / 100,
                armLength: Math.round(armLength * 100) / 100
              };

              // Log để debug
              console.log('New measurements:', newMeasurements);
              
              return newMeasurements;
            });
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
      <h1>Your look</h1>
      <video ref={videoRef} className="tryon-video" />

      <h1>Virtual measurements</h1>
      <canvas ref={canvasRef} className="tryon-canvas" />
      
      <div className="measurements-display">
        <h2>Số đo cơ thể (pixels)</h2>
        <div className="measurement-item">
          <span>Vai rộng: </span>
          <strong>{measurements.shoulderWidth > 0 ? measurements.shoulderWidth.toFixed(2) : '--'} px</strong>
        </div>
        <div className="measurement-item">
          <span>Chiều dài thân: </span>
          <strong>{measurements.torsoLength > 0 ? measurements.torsoLength.toFixed(2) : '--'} px</strong>
        </div>
        <div className="measurement-item">
          <span>Chiều dài thân trên: </span>
          <strong>{measurements.upperBodyLength > 0 ? measurements.upperBodyLength.toFixed(2) : '--'} px</strong>
        </div>
        <div className="measurement-item">
          <span>Chiều dài tay: </span>
          <strong>{measurements.armLength > 0 ? measurements.armLength.toFixed(2) : '--'} px</strong>
        </div>
        <div className="measurement-item">
          <span>Trạng thái: </span>
          <strong style={{color: measurements.shoulderWidth > 0 ? '#4CAF50' : '#ff6b6b'}}>
            {measurements.shoulderWidth > 0 ? 'Đang đo' : 'Chưa phát hiện'}
          </strong>
        </div>
      </div>
    </div>
  );
}