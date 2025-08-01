import React, { useState } from 'react';
import './Payment.css';

const Payment = () => {
  const [showQRScanner, setShowQRScanner] = useState(false);

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="header">
        <div className="menu-icon"></div>
        <h1 className="header-title">Payment information</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Main 2-column layout */}
      <div className="payment-content">
        {/* Left column */}
        <div className="left-section">
          {/* Product Info Card */}
          <div className="product-card">
            <div className="product-info">
              <div className="product-icon">
                <svg viewBox="0 0 100 100" className="aodai-icon">
                  <path
                    d="M25 20 L75 20 L75 35 L70 35 L70 80 L60 80 L60 70 L40 70 L40 80 L30 80 L30 35 L25 35 Z M35 25 L35 30 L65 30 L65 25 Z M20 35 L20 80 L25 80 L25 35 Z M75 35 L75 80 L80 80 L80 35 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="product-details">
                <h2 className="product-title">
                  QR Code<br />Your Ao Dai
                </h2>
                <p className="product-brand">Lê Sĩ Hoàng</p>
              </div>
            </div>
          </div>

        {/* QR Code Section */}
<div className="qr-section">
  <h3 className="qr-title">QR Code for your clothes</h3>

  <div className="qr-display">
    <div className="qr-code">
      {/* Chèn ảnh QR thay vì tạo bằng div */}
      <img
        src="/qr.png"
        alt="QR Code"
        className="qr-image"
      />
    </div>
    <p className="username">@hoang_si</p>
  </div>
</div>

          {/* QR Scanner Button */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="scanner-button"
          >
            <span className="qr-icon">⚏</span>
            <span>Scan your QR Code</span>
          </button>
        </div>

        {/* Right column: Áo dài image */}
        <div className="right-section">
          <img src="/sketch.jpg" alt="Ao Dai" className="aodai-image" />
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Scan here</h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="close-button"
              >
                ✕
              </button>
            </div>
            <div className="camera-placeholder">
              <div className="camera-icon">📷</div>
              <p>Camera here</p>
            </div>
            <button
              onClick={() => setShowQRScanner(false)}
              className="close-modal-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
