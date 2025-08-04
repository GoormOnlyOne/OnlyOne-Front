import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import EmptyState from '../components/domain/search/EmptyState';

interface Meeting {
  club_id: number;
  name: string;
  introduction: string;
  interest: string;
  district: string;
  member_count: number;
  image: string;
}

// 임시 데이터 (실제로는 API에서 가져와야 함)
const meetingData: Meeting[] = [
  {
    club_id: 1,
    name: '게이트볼',
    introduction: '게이트볼 모임 입니다.',
    interest: '운동',
    district: '강남구',
    member_count: 10,
    image: 'https://readdy.ai/api/search-image?query=People%20running%20together%20in%20Han%20River%20park%20Seoul%2C%20morning%20exercise%2C%20beautiful%20sunrise%2C%20group%20activity%2C%20healthy%20lifestyle%2C%20outdoor%20sports%2C%20Korean%20cityscape%20in%20background%2C%20vibrant%20and%20energetic%20atmosphere&width=400&height=240&seq=1&orientation=landscape'
  },
  {
    club_id: 2,
    name: '한강 러닝 크루',
    introduction: '매주 토요일 아침 한강에서 함께 달려요!',
    interest: '운동',
    district: '용산구',
    member_count: 25,
    image: 'https://readdy.ai/api/search-image?query=Italian%20cooking%20class%2C%20people%20making%20pasta%20together%2C%20modern%20kitchen%20studio%2C%20ingredients%20and%20cooking%20tools%2C%20warm%20lighting%2C%20collaborative%20cooking%20experience%2C%20professional%20chef%20instruction%2C%20cozy%20atmosphere&width=400&height=240&seq=2&orientation=landscape'
  },
  {
    club_id: 3,
    name: '북클럽 독서모임',
    introduction: '한 달에 한 권, 함께 읽고 토론해요',
    interest: '문화',
    district: '마포구',
    member_count: 15,
    image: 'https://readdy.ai/api/search-image?query=Cozy%20book%20cafe%20reading%20group%2C%20people%20discussing%20books%2C%20warm%20lighting%2C%20comfortable%20seating%2C%20bookshelves%2C%20coffee%20cups%2C%20intellectual%20atmosphere%2C%20modern%20interior%20design%2C%20peaceful%20ambiance&width=400&height=240&seq=3&orientation=landscape'
  },
  {
    club_id: 4,
    name: "요가 필라테스",
    introduction: "몸과 마음의 균형을 찾는 요가 모임",
    interest: "운동",
    district: "서초구",
    member_count: 20,
    image: 'https://readdy.ai/api/search-image?query=Jeju%20Island%20travel%20group%2C%20beautiful%20coastal%20scenery%2C%20travelers%20exploring%20together%2C%20clear%20blue%20sky%2C%20scenic%20landscape%2C%20adventure%20and%20friendship%2C%20Korean%20island%20paradise%2C%20outdoor%20exploration&width=400&height=240&seq=4&orientation=landscape'
  },
  {
    club_id: 5,
    name: '사진 출사 모임',
    introduction: '주말마다 서울 곳곳을 누비며 사진 촬영해요',
    interest: '문화',
    district: '종로구',
    member_count: 18,
    image: 'https://readdy.ai/api/search-image?query=Guitar%20playing%20group%20session%2C%20musicians%20jamming%20together%2C%20music%20studio%20setting%2C%20acoustic%20and%20electric%20guitars%2C%20amplifiers%2C%20warm%20studio%20lighting%2C%20creative%20musical%20atmosphere%2C%20collaborative%20performance&width=400&height=240&seq=5&orientation=landscape'
  },
  {
    club_id: 6,
    name: '맛집 탐방대',
    introduction: '서울의 숨은 맛집을 찾아다니는 미식 모임',
    interest: '사교',
    district: '강남구',
    member_count: 30,
    image: 'https://readdy.ai/api/search-image?query=Movie%20discussion%20group%2C%20people%20talking%20about%20films%2C%20cinema%20lobby%2C%20movie%20posters%2C%20comfortable%20seating%20area%2C%20enthusiastic%20film%20lovers%2C%20modern%20movie%20theater%20interior%2C%20engaging%20conversation&width=400&height=240&seq=6&orientation=landscape'
  }
];

export const Search = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [searchResults, setSearchResults] = useState<Meeting[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setIsSearched(true);

    // 검색 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      const results = meetingData.filter(meeting => 
        meeting.name.toLowerCase().includes(query.toLowerCase()) ||
        meeting.introduction.toLowerCase().includes(query.toLowerCase()) ||
        meeting.interest.toLowerCase().includes(query.toLowerCase()) ||
        meeting.district.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  };

  const handleJoinMeeting = (clubId: number) => {
    // 모임 가입 로직
    console.log(`모임 ${clubId}에 가입`);
    // 실제로는 API 호출 후 성공 메시지 표시
    alert('모임 가입이 완료되었습니다!');
  };

  const handleMeetingClick = (clubId: number) => {
    // 모임 상세 페이지로 이동
    navigate(`/meeting/${clubId}`);
  };

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto bg-gray-50">
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
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  '<span className="font-semibold text-gray-800">{searchQuery}</span>' 검색 결과
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  총 {searchResults.length}개의 모임을 찾았어요
                </p>
              </div>
              
              <div className="space-y-4">
                {searchResults.map((meeting) => (
                  <div 
                    key={meeting.club_id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMeetingClick(meeting.club_id)}
                  >
                    <div className="relative">
                      <img 
                        src={meeting.image}
                        alt={meeting.name}
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {meeting.interest}
                      </span>
                      <button 
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 좋아요 로직
                        }}
                      >
                        <i className="ri-heart-line text-gray-600"></i>
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{meeting.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meeting.introduction}</p>
                      
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
                          onClick={(e) => {
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

            // 추천 검색어
            // <div className="mt-8">
            //   <p className="text-sm font-semibold text-gray-700 mb-3">이런 모임은 어때요?</p>
            //   <div className="flex flex-wrap gap-2">
            //     {['러닝', '독서', '요가', '사진', '맛집'].map((keyword) => (
            //       <button
            //         key={keyword}
            //         onClick={() => handleSearch(keyword)}
            //         className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            //       >
            //         {keyword}
            //       </button>
            //     ))}
            //   </div>
            // </div>
          )}
        </>
      )}
    </div>
  );
};

export { Search as default } from '../pages/Search';