'use client';

import { useState, useEffect } from 'react';

interface Meeting {
  club_id: number;
  name: string;
  introduction: string;
  interest: string;
  district: string;
  member_count: number;
  image: string;
}

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

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>(meetingData);
  const [loading, setLoading] = useState(false);

  const loadMoreMeetings = () => {
    if (loading) return;
    
    setLoading(true);
    setTimeout(() => {
      const newMeetings = meetingData.map(meeting => ({
        ...meeting,
        club_id: meeting.club_id + meetings.length,
        member_count: Math.floor(Math.random() * 30) + 5
      }));
      setMeetings(prev => [...prev, ...newMeetings]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollHeight = target.scrollHeight;
      const scrollTop = target.scrollTop;
      const clientHeight = target.clientHeight;
      
      // 스크롤이 바닥에서 100px 이내에 도달했을 때
      if (scrollHeight - scrollTop - clientHeight < 100) {
        if (!loading) {
          loadMoreMeetings();
        }
      }
    };

    // main 요소 찾기
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [loading, meetings.length]);

  return (
    <div className="px-4 pb-20">
      <h2 className="text-base font-semibold text-gray-800 leading-snug mb-2">내 주변에서 관심있는 모임을 확인 해보세요.</h2>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.club_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src={meeting.image}
                alt={meeting.name}
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {meeting.interest}
              </span>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors">
                <i className="ri-heart-line text-gray-600"></i>
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{meeting.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{meeting.introduction}</p>
              
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
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer hover:shadow-md transition-shadow">
                  가입하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 로딩 스피너 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}