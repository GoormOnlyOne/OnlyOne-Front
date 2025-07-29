import { useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  category: string;
  participants: number;
  maxParticipants: number;
  location: string;
  date: string;
  time: string;
  image: string;
}

// 샘플 데이터
const sampleMeetings: Meeting[] = [
  {
    id: '1',
    title: '주말 등산모임',
    category: 'sports',
    participants: 8,
    maxParticipants: 12,
    location: '북한산',
    date: '2024-01-20',
    time: '09:00',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400'
  },
  {
    id: '2',
    title: '커피 원데이 클래스',
    category: 'culture',
    participants: 6,
    maxParticipants: 8,
    location: '강남구 카페',
    date: '2024-01-22',
    time: '14:00',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
  },
  {
    id: '3',
    title: '영어 회화 스터디',
    category: 'language',
    participants: 4,
    maxParticipants: 6,
    location: '온라인',
    date: '2024-01-25',
    time: '19:00',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'
  }
];

interface MeetingListProps {
  selectedCategory?: string;
}

export default function MeetingList({ selectedCategory }: MeetingListProps) {
  const [meetings] = useState<Meeting[]>(sampleMeetings);

  // 선택된 카테고리가 있으면 필터링
  const filteredMeetings = selectedCategory 
    ? meetings.filter(meeting => meeting.category === selectedCategory)
    : meetings;

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {selectedCategory ? '카테고리별 모임' : '추천 모임'}
        </h2>
        <button className="text-blue-500 text-sm font-medium">
          더보기
        </button>
      </div>
      
      <div className="space-y-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={meeting.image}
                    alt={meeting.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {meeting.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <i className="ri-map-pin-line mr-1"></i>
                      {meeting.location}
                    </span>
                    <span className="flex items-center">
                      <i className="ri-calendar-line mr-1"></i>
                      {meeting.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {meeting.participants}/{meeting.maxParticipants}명
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ 
                            width: `${(meeting.participants / meeting.maxParticipants) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <button className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                      참여하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">해당 카테고리의 모임이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}