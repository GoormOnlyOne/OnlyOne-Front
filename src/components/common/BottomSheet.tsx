import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxHeight?: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  maxHeight = '60vh',
  scrollRef,
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden animate-slide-up flex flex-col"
        style={{ maxHeight }}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center py-3 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          )}
        </div>

        {/* 내용 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};
