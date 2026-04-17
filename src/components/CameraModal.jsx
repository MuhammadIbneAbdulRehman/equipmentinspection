import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, RefreshCw, Check } from 'lucide-react';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to back camera

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = () => {
    onCapture(imgSrc);
    onClose();
    setImgSrc(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ 
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl" style={{ 
        background: '#0f172a',
        borderRadius: '24px',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '640px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            padding: '10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            borderRadius: '50%',
            width: '44px',
            height: '44px'
          }}
        >
          <X size={24} />
        </button>

        {/* Viewport */}
        <div style={{ 
          aspectRatio: '4/3', 
          background: 'black', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {imgSrc ? (
            <img src={imgSrc} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, width: 1280, height: 720 }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Controls */}
        <div style={{ 
          padding: '32px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '24px',
          background: 'linear-gradient(to bottom, #1e293b, #0f172a)'
        }}>
          {!imgSrc ? (
            <>
              <button 
                onClick={switchCamera}
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '50%'
                }}
              >
                <RefreshCw size={24} />
              </button>
              
              <button 
                onClick={capture}
                style={{
                  width: '84px',
                  height: '84px',
                  background: 'var(--accent-color)',
                  color: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(193,164,100,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Camera size={36} />
              </button>

              <div style={{ width: '56px' }}></div> {/* Spacer for symmetry */}
            </>
          ) : (
            <>
              <button 
                onClick={retake}
                className="btn-secondary"
                style={{
                  padding: '14px 32px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={20} style={{ marginRight: '8px' }} /> RETAKE
              </button>
              
              <button 
                onClick={confirm}
                style={{
                  padding: '14px 40px',
                  borderRadius: '16px',
                  background: 'var(--success)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 8px 16px rgba(16,185,129,0.3)'
                }}
              >
                <Check size={20} style={{ marginRight: '8px' }} /> CONFIRM
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
