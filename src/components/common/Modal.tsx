import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  cancelText?: string;
  confirmText?: string;
  variant?: 'default' | 'danger';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  cancelText = '취소',
  confirmText = '확인',
  variant = 'default'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll('button');
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div
        ref={modalRef}
        className="bg-gray-100 rounded-lg shadow-xl max-w-md w-full mx-4 p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="text-center mb-8">
          <h2
            id="modal-title"
            className="text-xl font-medium text-black leading-relaxed"
          >
            {title}
          </h2>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            className={clsx(
              'px-8 py-3 rounded-lg font-medium text-base whitespace-nowrap min-w-[120px] h-12',
              'bg-amber-900 text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-900 focus:ring-offset-2',
              'transition-colors duration-200'
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={clsx(
              'px-8 py-3 rounded-lg font-medium text-base whitespace-nowrap min-w-[120px] h-12',
              'transition-colors duration-200',
              variant === 'danger' 
                ? 'bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                : 'bg-yellow-400 text-amber-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;