import CreateMeetingCard from '../../components/domain/meeting/CreateMeetingCard';
import MeetingList from '../../components/domain/meeting/MeetingList';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';

export const Meeting = () => {
  return (
    <div className="flex flex-col bg-gray-50">
      {/* 모임 만들기 카드 */}
      <div className="p-4">
        <CreateMeetingCard />
      </div>

      {/* 추천 모임 리스트 */}
      {/* TODO: 동적 title, data 전달 예정 */}
      <MeetingList />

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Meeting as default } from './Meeting';
