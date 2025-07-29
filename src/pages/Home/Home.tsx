import { useState } from 'react';
import CategorySection from '../../components/domain/category/CategorySection';
import CreateMeetingCard from '../../components/domain/meeting/CreateMeetingCard';
import MeetingList from '../../components/domain/meeting/MeetingList';

export const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategorySelect = (categoryId: string | string[]) => {
    // filter 타입에서는 string으로 전달됨
    if (typeof categoryId === 'string') {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* 카테고리 섹션 */}
      <CategorySection 
        type="filter"
        onCategorySelect={handleCategorySelect}
      />

      {/* 모임 만들기 카드 */}
      <div className="px-4 pb-4">
        <CreateMeetingCard />
      </div>

      {/* 추천 모임 리스트 */}
      <MeetingList selectedCategory={selectedCategory} />
    </div>
  );
};

export { Home as default } from './Home';