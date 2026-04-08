import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div className="glass-card shadow-lg p-0 border-0 overflow-hidden" style={{ width: '90%', maxWidth: '500px' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <h5 className="mb-0 text-sand">{title}</h5>
          <button onClick={onClose} className="btn btn-link text-white p-0">
            <X size={24} />
          </button>
        </div>
        <div className="p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
