import CategorySection from '../../components/domain/category/CategorySection';
import CreateMeetingCard from '../../components/domain/meeting/CreateMeetingCard';
import MeetingList from '../../components/domain/meeting/MeetingList';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';

export const Home = () => {
  return (
    <div className="flex flex-col bg-gray-50">
      {/* 카테고리 섹션 */}
      <div className="px-4 py-6">
        <CategorySection mode="navigation" />
      </div>

      {/* 모임 만들기 카드 */}
      <div className="px-4 pb-4">
        <CreateMeetingCard />
      </div>

      {/* 추천 모임 리스트 */}
      <MeetingList />

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Home as default } from './Home';