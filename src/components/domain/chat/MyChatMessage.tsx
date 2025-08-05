import React from 'react';

interface MyChatMessageProps {
  message: string;
  timestamp: string;
  isRead?: boolean; // 읽음 표시 여부
  userId: number;
}

const MyChatMessage: React.FC<MyChatMessageProps> = ({
  message,
  timestamp,
  isRead = false,
  userId,
}) => {
  return (
    <div
      className="flex items-end justify-end space-x-2 mb-4"
      data-user-id={userId}
    >
      {/* 읽음 표시와 시간 */}
      <div className="flex flex-col items-end space-y-1">
        {/* 읽음 표시 */}
        {isRead && <div className="text-xs text-blue-500">읽음</div>}

        {/* 시간 */}
        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>

      {/* 메시지 말풍선 */}
      <div className="max-w-xs sm:max-w-md">
        <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-2 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyChatMessage;
