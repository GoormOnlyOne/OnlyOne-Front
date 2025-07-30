import { useState } from 'react';

import CategorySection from '../../components/domain/category/CategorySection';
import MeetingList from '../../components/domain/meeting/MeetingList';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import AddressSelector, { type AddressData } from '../../components/common/AddressSelector';

export const Category = () => {
  const type = 1;
  const [address, setAddress] = useState<AddressData>({
    city: '',
    district: '',
    isComplete: false
  });
  const handleAddressChange = (address: AddressData) => {
    setAddress(address);
    console.log(address);
  }
  return (
    <div className="flex flex-col bg-gray-50">
      { type === 2 ? (
        // 1. 카테고리 섹션 - 단일 선택 
        <div className='px-4 py-6'>
          <CategorySection
            mode="single-select"
            onCategoryChange={(categoryId) => {
              console.log('선택된 카테고리:', categoryId); // TODO: 선택 카테고리 id로 API 요청 예정
            }}
            defaultSelected="culture" // 첫 번째 '문화' 항목 기본 값 설정
          />
        </div>
      ) : (
        // 2. 주소 섹션
        <AddressSelector 
          onAddressChange={handleAddressChange}
          initialCity="서울"
          initialDistrict="종로구"
          className="mb-4"
        />
      ) }


      {/* 추천 모임 리스트 */}
      {/* TODO: 필터링된 API 응답받아, MeetingList prams로 전달 예정 */}
      <MeetingList />

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Category as default } from './Category';