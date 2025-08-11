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
  variant = 'default',
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
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 ease-out pointer-events-auto border-2 border-[#F5921F]/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(245, 146, 31, 0.1)',
        }}
      >
        <div className="text-center mb-6">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-900 leading-relaxed"
          >
            {title}
          </h2>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            className={clsx(
              'px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap min-w-[100px] h-11',
              'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
              'transition-all duration-200 transform hover:scale-105 active:scale-95',
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={clsx(
              'px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap min-w-[100px] h-11',
              'transition-all duration-200 transform hover:scale-105 active:scale-95',
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                : 'bg-[#F5921F] text-white hover:bg-[#EF7C30] focus:outline-none focus:ring-2 focus:ring-[#F5921F] focus:ring-offset-2',
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
