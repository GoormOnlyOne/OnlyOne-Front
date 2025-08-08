import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import CategorySection from '../../components/domain/category/CategorySection';
import MeetingList from '../../components/domain/meeting/MeetingList';
import MeetingCard from '../../components/domain/meeting/MeetingCard';
import EmptyState from '../../components/domain/search/EmptyState';
import apiClient from '../../api/client';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import AddressSelector, {
  type AddressData,
} from '../../components/common/AddressSelector';
import TabBar from '../../components/common/TabBar';
import type { TabItem } from '../../components/common/TabBar';

export const Category = () => {
  const [searchParams] = useSearchParams();
  const selectedCategoryFromUrl = searchParams.get('selected');
  const [activeTab, setActiveTab] = useState<string>('interest');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(selectedCategoryFromUrl || 'culture');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationMeetings, setLocationMeetings] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [address, setAddress] = useState<AddressData>({
    city: '서울',
    district: '종로구',
    isComplete: true,
  });

  const handleAddressChange = (address: AddressData) => {
    setAddress(address);
    console.log('주소 변경:', address);
    if (address.isComplete) {
      loadMeetingsByLocation(address.city, address.district);
    }
  };

  const handleInterestChange = (categoryId: string | string[]) => {
    const selectedId = typeof categoryId === 'string' ? categoryId : categoryId[0];
    setSelectedInterest(selectedId);
    console.log('선택된 관심사:', selectedId);
    loadMeetingsByCategory(selectedId);
  };

  // 카테고리 ID를 숫자로 변환하는 함수
  const getCategoryNumericId = (categoryId: string): number => {
    const categoryMap: { [key: string]: number } = {
      'culture': 1,
      'sports': 2, 
      'travel': 3,
      'music': 4,
      'craft': 5,
      'social': 6,
      'language': 7,
      'finance': 8
    };
    return categoryMap[categoryId] || 1;
  };

  const loadMeetingsByCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      const interestId = getCategoryNumericId(categoryId);
      const response = await apiClient.get(`/search/interests?${interestId}`, {
        params: { interestId, page: 0, size: 20 }
      });
      if (response.success) {
        setMeetings(response.data);
      }
    } catch (error) {
      console.error('관심사별 모임 조회 실패:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetingsByLocation = async (city: string, district: string) => {
    setLocationLoading(true);
    try {
      const response = await apiClient.get(`/search/locations`, {
        params: { city, district, page: 0, size: 20 }
      });
      console.log('지역별 모임 조회 응답:', response);
      if (response.success) {
        setLocationMeetings(response.data);
      } else {
        setLocationMeetings([]);
      }
    } catch (error) {
      console.error('지역별 모임 조회 실패:', error);
      setLocationMeetings([]);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInterest) {
      loadMeetingsByCategory(selectedInterest);
    }
    // 초기 지역별 모임 로드
    if (address.isComplete) {
      loadMeetingsByLocation(address.city, address.district);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('탭 변경:', tabId);

    // 탭 변경 시 맨 위로 스크롤
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categoryTabs: TabItem[] = [
    {
      id: 'interest',
      label: '관심사로 찾아보기',
      content: (
        <>
          <div className="px-4 py-6">
            <CategorySection
              mode="single-select"
              onCategoryChange={handleInterestChange}
              defaultSelected={selectedCategoryFromUrl || "culture"}
            />
          </div>
          
          {/* 모임 리스트 */}
          <div className="px-4 py-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : meetings.length > 0 ? (
              <div className="space-y-4">
                {meetings.map(meeting => (
                  <MeetingCard key={meeting.clubId} meeting={meeting} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="해당 관심사의 모임이 없습니다"
                description="다른 관심사를 선택해보시거나 새로운 모임을 만들어보세요"
                showCreateButton={true}
              />
            )}
          </div>
        </>
      ),
    },
    {
      id: 'location',
      label: '지역으로 찾아보기',
      content: (
        <>
          <div className="p-4">
            <AddressSelector
              onAddressChange={handleAddressChange}
              initialCity="서울"
              initialDistrict="종로구"
              className="mb-4"
            />
          </div>
          
          {/* 지역별 모임 리스트 */}
          <div className="px-4 py-6">
            {locationLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : locationMeetings.length > 0 ? (
              <div className="space-y-4">
                {locationMeetings.map(meeting => (
                  <MeetingCard key={meeting.clubId} meeting={meeting} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`${address.city} ${address.district}에 해당하는 모임이 없습니다`}
                description="다른 지역을 선택해보시거나 새로운 모임을 만들어보세요"
                showCreateButton={true}
              />
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50">
      {/* 고정된 탭바 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <TabBar
          tabs={categoryTabs}
          defaultTab="interest"
          onTabChange={handleTabChange}
        />
      </div>

      {/* 맨 위로 가기 버튼 */}
      <ScrollToTopButton />
    </div>
  );
};

export { Category as default } from './Category';
