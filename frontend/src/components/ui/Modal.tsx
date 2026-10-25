import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px'
}) => {
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

    if (isOpen) {
      setSparkle(true);
      const t = setTimeout(() => setSparkle(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal-stars" aria-hidden="true" />
      <div className="glitter-shine" aria-hidden="true" />
      <div className="ui-modal" style={{ maxWidth }} onClick={event => event.stopPropagation()}>
        <div className="modal-glow-ring" aria-hidden="true" />
        <div className="modal-lights" aria-hidden="true">
          <div className="modal-light" style={{ top: '15%', left: '12%' }} />
          <div className="modal-light" style={{ top: '25%', left: '78%' }} />
          <div className="modal-light" style={{ top: '55%', left: '8%' }} />
          <div className="modal-light" style={{ top: '70%', left: '82%' }} />
          <div className="modal-light" style={{ top: '35%', left: '50%' }} />
        </div>
        {sparkle && <div className="modal-sparkle-burst" aria-hidden="true" />}
        <div className="ui-modal__head">
          <div className="modal-water-drop" style={{ top: '0.6rem', left: '1rem' }} aria-hidden="true" />
          <div className="modal-water-drop" style={{ top: '1.2rem', left: '1.6rem' }} aria-hidden="true" />
          <h2 className="ui-modal__title">{title}</h2>
          <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
};
