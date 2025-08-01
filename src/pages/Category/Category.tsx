import { useState } from 'react';

import CategorySection from '../../components/domain/category/CategorySection';
import MeetingList from '../../components/domain/meeting/MeetingList';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import AddressSelector, { type AddressData } from '../../components/common/AddressSelector';
import TabBar from '../../components/common/TabBar';
import type { TabItem } from '../../components/common/TabBar';

export const Category = () => {
  const [activeTab, setActiveTab] = useState<string>('interest');
  const [address, setAddress] = useState<AddressData>({
    city: '',
    district: '',
    isComplete: false
  });

  const tabs: TabItem[] = [
    { id: 'interest', label: '관심사로 찾아보기' },
    { id: 'location', label: '지역으로 찾아보기' }
  ];

  const handleAddressChange = (address: AddressData) => {
    setAddress(address);
    console.log(address);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('탭 변경:', tabId);
    
    // 탭 변경 시 맨 위로 스크롤
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* 고정된 탭바 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <TabBar
          tabs={tabs}
          defaultTab="interest"
          onTabChange={handleTabChange}
        />
      </div>

      {/* 탭 내용 */}
      <div className="flex-1">
        {activeTab === 'interest' ? (
          // 관심사로 찾아보기 - 카테고리 섹션
          <div className='px-4 py-6'>
            <CategorySection
              mode="single-select"
              onCategoryChange={(categoryId) => {
                console.log('선택된 카테고리:', categoryId);
              }}
              defaultSelected="culture"
            />
          </div>
        ) : (
          // 지역으로 찾아보기 - 주소 섹션
          <div className="p-4">
            <AddressSelector 
              onAddressChange={handleAddressChange}
              initialCity="서울"
              initialDistrict="종로구"
              className="mb-4"
            />
          </div>
        )}
      </div>

      {/* 추천 모임 리스트 */}
      <MeetingList />

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Category as default } from './Category';