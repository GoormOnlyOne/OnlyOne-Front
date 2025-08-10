import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import EmptyState from '../components/domain/search/EmptyState';
import apiClient from '../api/client';
import { FilterBottomSheet } from '../components/domain/search/FilterBottomSheet';
import { FilterChips } from '../components/domain/search/FilterChips';
import MeetingCard from '../components/domain/meeting/MeetingCard';
import { useToast } from '../components/common/Toast/ToastContext';

interface Meeting {
  clubId: number;
  name: string;
  description: string;
  interest: string;
  district: string;
  memberCount: number;
  image: string;
  joined: boolean;
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
  const { showToast } = useToast();
  const [searchResults, setSearchResults] = useState<Meeting[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

  const validateSearch = (query: string, searchFilters: SearchFilters) => {
    // 검색어가 있는데 2글자 미만인 경우
    if (query.trim() && query.trim().length < 2) {
      showToast('검색어는 2글자 이상 입력해주세요.', 'warning');
      return false;
    }
    return true;
  };

  const handleSearch = useCallback(async (query: string, searchFilters = filters, pageNum = 0, isNewSearch = false) => {
    // 검색 유효성 검사
    if (isNewSearch && !validateSearch(query, searchFilters)) {
      return;
    }

    setIsLoading(true);
    if (isNewSearch) {
      setIsSearched(true);
      setPage(0);
      setHasMore(true);
    }

    try {
      const trimmedQuery = query.trim();
      
      const params = {
        // 키워드가 있으면 포함, 없으면 undefined
        keyword: trimmedQuery || undefined,
        city: searchFilters.city || undefined,
        district: searchFilters.district || undefined,
        interestId: searchFilters.interestId || undefined,
        sortBy: searchFilters.sortBy,
        page: pageNum,
        size: 20
      };

      const response = await apiClient.get<Meeting[]>('/search', { params });
			console.log(response);
      if (response.success) {
        const newResults = response.data;
        
        if (isNewSearch) {
          setSearchResults(newResults);
        } else {
          setSearchResults(prev => [...prev, ...newResults]);
        }

        // 더 이상 데이터가 없으면 hasMore를 false로 설정
        if (newResults.length < 20) {
          setHasMore(false);
        }
      } else {
        if (isNewSearch) {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('검색 실패:', error);
      if (isNewSearch) {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // 검색어가 있거나, 검색어가 없어도 검색이 실행되도록 변경
    // searchQuery가 변경될 때마다 검색 실행
    handleSearch(searchQuery, filters, 0, true);
  }, [searchQuery, handleSearch]);

  // 무한 스크롤
  useEffect(() => {
    if (!isSearched) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        handleSearch(searchQuery, filters, nextPage, false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, isLoading, isSearched, searchQuery, filters, handleSearch]);

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // 필터가 적용되면 항상 검색 실행 (검색어 유무 관계없이)
    handleSearch(searchQuery, newFilters, 0, true);
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
    
    // 필터 제거 시에도 항상 검색 실행
    handleSearch(searchQuery, newFilters, 0, true);
  };

  const handleClearAllFilters = () => {
    const defaultFilters = {
      city: '',
      district: '',
      interestId: null,
      sortBy: 'MEMBER_COUNT' as const
    };
    setFilters(defaultFilters);
    
    // 전체 필터 초기화 시에도 항상 검색 실행
    handleSearch(searchQuery, defaultFilters, 0, true);
  };

  const hasActiveFilters = () => {
    return filters.city || filters.interestId;
  };

  const handleJoinSuccess = (clubId: number) => {
    // 가입 성공 시 해당 모임의 joined 상태를 업데이트
    setSearchResults(prev => 
      prev.map(meeting => 
        meeting.clubId === clubId 
          ? { ...meeting, joined: true }
          : meeting
      )
    );
  };

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto bg-gray-50">
      {/* 필터 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        {/* 필터 바 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* 지역 필터 */}
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.city
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-map-pin-line text-base"></i>
              지역
            </button>
            
            {/* 관심사 필터 */}
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.interestId
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-heart-line text-base"></i>
              관심사
            </button>
            
            {/* 정렬 필터 */}
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.sortBy === 'LATEST'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-sort-desc text-base"></i>
							정렬
            </button>
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
            모임명, 모임소개, 카테고리, 지역으로 검색할 수 있어요
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
                  <MeetingCard 
                    key={meeting.clubId} 
                    meeting={meeting} 
                    onJoinSuccess={handleJoinSuccess}
                  />
                ))}
              </div>

              {/* 무한스크롤 상태 표시 */}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
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