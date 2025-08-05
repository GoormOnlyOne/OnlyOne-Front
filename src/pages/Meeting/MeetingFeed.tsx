import React from 'react';
import { useParams } from 'react-router-dom';
import MeetingFeedGrid from '../../components/domain/meeting/MeetingFeedGrid';

const MeetingFeed: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  if (!clubId) return null;

  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">게시판</h3>
        <p>모임 사진과 후기를 공유해보세요.</p>
      </div>

      {/* 그리드 + 무한 스크롤; clubId prop 전달 */}
      <MeetingFeedGrid clubId={clubId} />

      {/* 등록 버튼: 항상 고정, 피드 위에 */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-xs mt-1">등록</span>
      </button>
    </div>
  );
};

export default MeetingFeed;

