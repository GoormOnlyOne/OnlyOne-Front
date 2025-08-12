import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MeetingFeedGrid from '../../components/domain/meeting/MeetingFeedGrid';

type Props = { readOnly?: boolean };

export const MeetingFeed: React.FC<Props> = ({ readOnly = false}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return null;

  return (
    <div className="relative">
      {/* 그리드 + 무한 스크롤; clubId prop 전달 */}
      <MeetingFeedGrid clubId={id} readOnly={readOnly} />

      {/* 등록 버튼: 항상 고정, 피드 위에 */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => navigate(`/meeting/${id}/feed/create`)}
          aria-label="피드 등록"
          className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs mt-1">등록</span>
        </button>
      )}
    </div>
  );
};

export { MeetingFeed as default } from './MeetingFeed';
