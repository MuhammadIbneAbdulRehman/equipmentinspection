// src/components/CameraModal.jsx

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw, Check } from 'lucide-react';
import './styles/CameraModal.css';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc);
  }, []);

  const retake = () => setImgSrc(null);

  const confirm = () => {
    onCapture(imgSrc);
    setImgSrc(null);
    onClose();
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="equip_Camera">
      <div className="equip_Camera__panel">
        <button
          className="equip_Camera__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Viewport */}
        <div className="equip_Camera__viewport">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="captured"
              className="equip_Camera__preview"
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, width: 1280, height: 720 }}
              className="equip_Camera__video"
            />
          )}
        </div>

        {/* Controls */}
        <div className="equip_Camera__controls">
          {!imgSrc ? (
            <>
              <button
                className="equip_Camera__sideBtn"
                onClick={switchCamera}
                aria-label="Switch camera"
              >
                <RefreshCw size={22} />
              </button>

              <button
                className="equip_Camera__captureBtn"
                onClick={capture}
                aria-label="Capture photo"
              >
                <Camera size={34} />
              </button>

              <div className="equip_Camera__spacer" />
            </>
          ) : (
            <div className="equip_Camera__actionRow">
              <button
                className="equip_Camera__retakeBtn"
                onClick={retake}
              >
                <RefreshCw size={18} /> Retake
              </button>
              <button
                className="equip_Camera__confirmBtn"
                onClick={confirm}
              >
                <Check size={18} /> Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;