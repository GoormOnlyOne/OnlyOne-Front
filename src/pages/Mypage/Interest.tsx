import MeetingList from '../../components/domain/meeting/MeetingList';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';

export const Interest = () => {
  return (
    <div className="flex flex-col bg-gray-50">
      {/* 추천 모임 리스트 */}
      <MeetingList />

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Interest as default } from './Interest';
