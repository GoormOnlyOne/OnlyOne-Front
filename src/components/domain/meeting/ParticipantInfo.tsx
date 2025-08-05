import React from 'react';
import clsx from 'clsx';

export interface ParticipantInfoProps {
  nickname: string;
  profileImage?: string | null;
  settlementStatus?: 'REQUESTED' | 'COMPLETED' | 'FAILED';
  className?: string;
}

export const ParticipantInfo: React.FC<ParticipantInfoProps> = ({
  nickname,
  profileImage,
  settlementStatus,
  className,
}) => {
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'REQUESTED':
        return '정산 요청';
      case 'COMPLETED':
        return '정산 완료';
      case 'FAILED':
        return '정산 실패';
      default:
        return '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'text-orange-600 bg-orange-50';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${nickname} 프로필`}
              className="w-full h-full object-cover"
            />
          ) : (
            <i className="ri-user-fill text-gray-400" />
          )}
        </div>

        <div className="text-base font-medium text-gray-900">{nickname}</div>
      </div>

      {settlementStatus && (
        <div
          className={clsx(
            'px-2 py-1 rounded-full font-medium text-sm',
            getStatusColor(settlementStatus),
          )}
        >
          {getStatusText(settlementStatus)}
        </div>
      )}
    </div>
  );
};

export default ParticipantInfo;
