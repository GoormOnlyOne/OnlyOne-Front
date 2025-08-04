import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScheduleList from '../../components/domain/meeting/ScheduleList';
import apiClient from '../../api/client';

// API 응답 타입
interface ClubDetailResponse {
  success: boolean;
  data: {
    clubId: number;
    name: string;
    userCount: number;
    description: string;
    clubImage: string;
    district: string;
    category: string;
    clubRole: 'LEADER' | 'MEMBER' | 'GUEST';
  };
}

// 컴포넌트에서 사용할 타입
interface Meeting {
  id: number;
  title: string;
  location: string;
  participantCount: number;
  image: string;
  category: string;
  description: string;
  role: 'LEADER' | 'MEMBER' | 'GUEST';
}

export const MeetingHome = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingDetail = async () => {
      if (!meetingId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get<ClubDetailResponse>(`/clubs/${meetingId}`);
        
        if (response.data.success) {
          const data = response.data.data;

          console.log('모임 정보:', data);
          
          
          // API 응답을 컴포넌트에서 사용하는 형태로 변환
          setMeeting({
            id: data.clubId,
            title: data.name,
            location: data.district,
            participantCount: data.userCount,
            image: data.clubImage || `https://readdy.ai/api/search-image?query=Korean%20people%20gathering%20for%20social%20meeting%20activity%2C%20warm%20atmosphere%2C%20indoor%20setting%2C%20friendly%20interaction%2C%20modern%20cafe%20or%20meeting%20room%2C%20soft%20lighting%2C%20diverse%20group%20of%20young%20adults%2C%20comfortable%20casual%20environment&width=375&height=200&seq=${meetingId}&orientation=landscape`,
            category: data.category,
            description: data.description,
            role: data.clubRole,
          });
        }
      } catch (err: any) {
        console.error('모임 정보 조회 실패:', err);
        setError(err.message || '모임 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetail();
  }, [meetingId]);

  if (loading) return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!meeting) return <div className="text-center">모임을 찾을 수 없습니다.</div>;

  return (
    <div className="px-4">
      {/* 모임 대표 이미지 */}
      <div className="w-full h-48 bg-gray-400 rounded-lg mb-6 overflow-hidden">
        {meeting.image ? (
          <img 
            src={meeting.image} 
            alt={meeting.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-lg">사진이 들어갑니다..</span>
          </div>
        )}
      </div>

      {/* 모임 정보 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">{meeting.title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {meeting.location} · {meeting.category} · 멤버 {meeting.participantCount}명
        </p>
        
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">모임 소개</h3>
          <p className="text-sm text-gray-700">{meeting.description}</p>
        </div>

        <div className="flex gap-2">
          {/* 모임장만 보이게 */}
          {meeting.role === 'LEADER' && (
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