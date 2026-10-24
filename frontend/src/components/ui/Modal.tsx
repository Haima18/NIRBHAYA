import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="ui-modal" style={{ maxWidth }} onClick={event => event.stopPropagation()}>
        <div className="ui-modal__head">
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
