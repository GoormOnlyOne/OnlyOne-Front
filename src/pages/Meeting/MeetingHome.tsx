import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScheduleList from '../../components/domain/meeting/ScheduleList';

interface Meeting {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  participantCount: number;
  image: string;
  category: string;
  description: string;
}

export const MeetingHome = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [userRole, setUserRole] = useState<'LEADER' | 'MEMBER' | 'GUEST'>('MEMBER'); // 실제 데이터로 설정 필요


  useEffect(() => {
    if (meetingId) {
      setMeeting({
        id: parseInt(meetingId),
        title: '모임 이름',
        location: '강남구',
        date: '12월 25일',
        time: '오후 7시',
        participantCount: 15,
        image: `https://readdy.ai/api/search-image?query=Korean%20people%20gathering%20for%20social%20meeting%20activity%2C%20warm%20atmosphere%2C%20indoor%20setting%2C%20friendly%20interaction%2C%20modern%20cafe%20or%20meeting%20room%2C%20soft%20lighting%2C%20diverse%20group%20of%20young%20adults%2C%20comfortable%20casual%20environment&width=375&height=200&seq=${meetingId}&orientation=landscape`,
        category: '문화',
        description: '모임 지역 · 모임 관심사 · 멤버수',
      });
    }
  }, [meetingId]);

  if (!meeting) return <div>로딩 중...</div>;

  return (
    <div className="px-4">
      {/* 모임 대표 이미지 */}
      <div className="w-full h-48 bg-gray-400 rounded-lg mb-6 flex items-center justify-center">
        <span className="text-white text-lg">사진이 들어갑니다..</span>
      </div>

      {/* 모임 정보 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">{meeting.title}</h2>
        <p className="text-sm text-gray-600 mb-4">{meeting.description}</p>
        
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">모임 한 줄 소개</h3>
        </div>

        <div className="flex gap-2">
          {/* 모임장만 보이게 */}
          {userRole === 'LEADER' && (
            <>
              <button
                onClick={() => navigate(`/meeting/${meeting.id}/edit`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 cursor-pointer"
              >
                모임 정보 수정
              </button>
              <button
                onClick={() => navigate(`/meeting/${meeting.id}/schedule/create`)}
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 cursor-pointer"
              >
                정기모임 추가
              </button>
            </>
          )}
        </div>
      </div>

      {/* 정기모임(스케줄) */}
      <div className="mb-8">
        <ScheduleList />
      </div>
    </div>
  );
};

export { MeetingHome as default } from './MeetingHome';