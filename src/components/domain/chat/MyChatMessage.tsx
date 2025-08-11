import React from 'react';

interface MyChatMessageProps {
  message?: string | null;
  imageUrl?: string | null;
  timestamp: string;
  isRead?: boolean; // 2차에서 사용 예정
  userId: number;
}

const MyChatMessage: React.FC<MyChatMessageProps> = ({
  message,
  imageUrl,
  timestamp,
  // isRead는 2차에서 UI에 반영 예정이므로 현재는 구조분해에서 제외하여 린트
  userId,
}) => {
  if (!imageUrl && (!message || message.trim() === '')) return null;
  return (
    <div className="flex items-end justify-end space-x-2 mb-4" data-user-id={userId}>
      <div className="flex flex-col items-end space-y-1">
        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>

      <div className="max-w-xs sm:max-w-md">
        {imageUrl ? (
          <img
            loading="lazy"
            src={imageUrl}
            alt="보낸 이미지"
            className="rounded-lg max-w-full h-auto shadow-md"
          />
        ) : (
          <div
            className="bg-[#FFAE00] text-white rounded-2xl rounded-tr-md px-4 py-2 shadow-sm"
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChatMessage;
