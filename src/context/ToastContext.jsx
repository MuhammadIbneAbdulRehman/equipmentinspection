import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />
  };

  const colors = {
    success: { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' },
    error: { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' },
    info: { bg: '#eff6ff', text: '#1e6fff', border: '#dbeafe' }
  };

  const color = colors[toast.type];

  return (
    <div 
      className="animate-fade-in"
      style={{
        pointerEvents: 'auto',
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        padding: '12px 16px',
        borderRadius: 12,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 300,
        justifyBetween: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        {icons[toast.type]}
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{toast.message}</span>
      </div>
      <button 
        onClick={onRemove}
        style={{ background: 'transparent', color: color.text, opacity: 0.5, padding: 4, borderRadius: '50%' }}
        className="hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => useContext(ToastContext);
