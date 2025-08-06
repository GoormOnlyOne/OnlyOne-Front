import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import EmptyState from '../components/domain/search/EmptyState';
import apiClient from '../api/client';
import { FilterBottomSheet } from '../components/domain/search/FilterBottomSheet';
import { FilterChips } from '../components/domain/search/FilterChips';

interface Meeting {
  club_id: number;
  name: string;
  description: string;
  category: string;
  district: string;
  member_count: number;
  club_image: string;
}

interface SearchFilters {
  city: string;
  district: string;
  interestId: number | null;
  sortBy: 'LATEST' | 'MEMBER_COUNT';
}

interface Interest {
  interestId: number;
  category: string;
}

export const Search = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [searchResults, setSearchResults] = useState<Meeting[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    district: '',
    interestId: null,
    sortBy: 'MEMBER_COUNT'
  });
  const navigate = useNavigate();

  // 정적 관심사 데이터
  const interests: Interest[] = [
    { interestId: 1, category: '문화' },
    { interestId: 2, category: '운동' },
    { interestId: 3, category: '여행' },
    { interestId: 4, category: '음악' },
    { interestId: 5, category: '공예' },
    { interestId: 6, category: '사교' },
    { interestId: 7, category: '외국어' },
    { interestId: 8, category: '재테크' }
  ];

  const handleSearch = useCallback(async (query: string, searchFilters = filters) => {
    setIsLoading(true);
    setIsSearched(true);

    try {
      const params = {
        keyword: query || undefined,
        city: searchFilters.city || undefined,
        district: searchFilters.district || undefined,
        interestId: searchFilters.interestId || undefined,
        sortBy: searchFilters.sortBy,
        page: 0,
        size: 20
      };

      const response = await apiClient.get<Meeting[]>('/clubs/search', { params });
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    if (searchQuery || isSearched) {
      handleSearch(searchQuery, newFilters);
    }
  };

  const handleRemoveFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    
    if (key === 'city') {
      newFilters.city = '';
      newFilters.district = '';
    } else if (key === 'interestId') {
      newFilters.interestId = null;
    }
    
    setFilters(newFilters);
    
    if (searchQuery || isSearched) {
      handleSearch(searchQuery, newFilters);
    }
  };

  const handleClearAllFilters = () => {
    const defaultFilters = {
      city: '',
      district: '',
      interestId: null,
      sortBy: 'MEMBER_COUNT' as const
    };
    setFilters(defaultFilters);
    
    if (searchQuery || isSearched) {
      handleSearch(searchQuery, defaultFilters);
    }
  };

  const hasActiveFilters = () => {
    return filters.city || filters.interestId;
  };

  const handleJoinMeeting = (clubId: number) => {
    console.log(`모임 ${clubId}에 가입`);
    alert('모임 가입이 완료되었습니다!');
  };

  const handleMeetingClick = (clubId: number) => {
    navigate(`/meeting/${clubId}`);
  };

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto bg-gray-50">
      {/* 필터 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        {/* 검색 결과 정보 */}
        {isSearched && (
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {searchQuery && (
                    <>
                      '<span className="font-semibold text-gray-800">{searchQuery}</span>' 
                    </>
                  )}
                  검색 결과
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  총 {searchResults.length}개의 모임
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 필터 바 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                hasActiveFilters()
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-equalizer-line text-base"></i>
              필터
            </button>
            
            {/* 빠른 정렬 버튼 */}
            {isSearched && searchResults.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyFilters({ ...filters, sortBy: 'MEMBER_COUNT' })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'MEMBER_COUNT'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  인기순
                </button>
                <button
                  onClick={() => handleApplyFilters({ ...filters, sortBy: 'LATEST' })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'LATEST'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  최신순
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 활성화된 필터 칩 */}
      <FilterChips
        filters={filters}
        interests={interests}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* 필터 바텀시트 */}
      <FilterBottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        interests={interests}
      />

      {/* 검색하기 전 상태 */}
      {!isSearched && (
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-center">
            찾고 싶은 모임을 검색해보세요
          </p>
          <p className="text-sm text-gray-500 mt-2">
            모임명, 카테고리, 지역으로 검색할 수 있어요
          </p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">검색 중...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {isSearched && !isLoading && (
        <>
          {searchResults.length > 0 ? (
            <div className="px-4 py-6">
              <div className="space-y-4">
                {searchResults.map(meeting => (
                  <div
                    key={meeting.club_id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMeetingClick(meeting.club_id)}
                  >
                    <div className="relative">
                      <img
                        src={meeting.club_image || 'https://via.placeholder.com/400x240'}
                        alt={meeting.name}
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {meeting.category}
                      </span>
                      <button
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors"
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <i className="ri-heart-line text-gray-600"></i>
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {meeting.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {meeting.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <i className="ri-map-pin-line mr-2"></i>
                            <span>{meeting.district}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <i className="ri-group-line mr-2"></i>
                            <span>멤버 {meeting.member_count}명</span>
                          </div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleJoinMeeting(meeting.club_id);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors hover:shadow-md"
                        >
                          가입하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="검색 결과가 없습니다"
              description={`'${searchQuery}'에 대한 모임을 찾을 수 없어요`}
              image="https://readdy.ai/api/search-image?query=Empty%20state%20illustration%2C%20no%20search%20results%2C%20minimalist%20design%2C%20soft%20colors&width=200&height=200"
              showCreateButton={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export { Search as default } from '../pages/Search';