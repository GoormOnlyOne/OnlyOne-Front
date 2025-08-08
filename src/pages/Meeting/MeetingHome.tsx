import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';
import ScheduleList from '../../components/domain/meeting/ScheduleList';
import apiClient from '../../api/client';
import Modal from '../../components/common/Modal';

// API 응답 타입
interface ClubDetailResponse {
  clubId: number;
  name: string;
  userCount: number;
  description: string;
  clubImage: string;
  district: string;
  category: string;
  clubRole: 'LEADER' | 'MEMBER' | 'GUEST';
}

// 화면에서 사용할 타입
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

const MeetingHome: React.FC = () => {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  // Modal state for join confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1) 모임 정보 Fetch
  useEffect(() => {
    if (!meetingId) return;

    const fetchMeetingDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ClubDetailResponse>(
          `/clubs/${meetingId}`,
        );

        if (response.success) {
          const data = response.data;
          // 현재 코드를 다음과 같이 수정:
          setMeeting({
            id: data.clubId,
            title: data.name,
            location: data.district,
            participantCount: data.userCount,
            image: data.clubImage || '',
            category: data.category,
            description: data.description,
            role: data.clubRole,
          });
        }
      } catch (err: unknown) {
        showApiErrorToast(err);
        navigate('/meeting');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetail();
  }, [meetingId, navigate]);

  // 2) GUEST용 Sticky CTA 애니메이션
  useEffect(() => {
    if (meeting?.role === 'GUEST') {
      const timer = setTimeout(() => setShowCTA(true), 400);
      return () => clearTimeout(timer);
    }
    setShowCTA(false);
  }, [meeting]);

  // Modal handlers
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleMeetingJoin = async () => {
    if (!meetingId) {
      handleModalClose();
      return;
    }
    try {
      // TODO: post로 수정 (프&백 둘다)
      const res = await apiClient.get<{ success: boolean }>(
        `/clubs/${meetingId}/join`,
      );
      if (res.success) {
        globalToast('모임에 가입하였습니다.', 'success', 2000);
        // 새로 고침 혹은 리다이렉트
        navigate(`/meeting/${meetingId}`);
      } else {
        throw new Error('가입에 실패했습니다.');
      }
    } catch (err: any) {
      showApiErrorToast(err);
    } finally {
      handleModalClose();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">로딩 중...</div>
    );
  }
  if (!meeting) {
    return <div className="text-center">모임을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="px-4 pb-20">
      {/* 대표 이미지 */}
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
      <h2 className="text-lg font-bold mb-2">{meeting.title}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {meeting.location} · {meeting.category} · 멤버{' '}
        {meeting.participantCount}명
      </p>
      <div className="mb-6">
        <h3 className="text-base font-medium mb-3">모임 소개</h3>
        <p className="text-sm text-gray-700">{meeting.description}</p>
      </div>

      {/* 리더 전용 버튼 */}
      {meeting.role === 'LEADER' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => navigate(`/meeting/${meeting.id}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
          >
            모임 정보 수정
          </button>
          <button
            onClick={() => navigate(`/meeting/${meeting.id}/schedule/create`)}
            className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600"
          >
            정기모임 추가
          </button>
        </div>
      )}

      {/* ScheduleList에 clubRole 전달 */}
      <div className="mb-8">
        <ScheduleList clubRole={meeting.role} />
      </div>

      {/* GUEST용 Sticky CTA */}
      {meeting.role === 'GUEST' && (
        <>
          <div
            className={`
              fixed left-0 right-0 bottom-0 z-40 flex justify-center
              transition-transform duration-500
              ${showCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
          >
            <button
              onClick={handleModalOpen}
              className="
                w-[90vw] max-w-md mb-6 py-4
                bg-blue-600 text-white text-lg font-bold
                rounded-xl shadow-lg
                hover:bg-blue-700 active:scale-95
                transition-all duration-200
              "
            >
              가입하기
            </button>
          </div>

          {/* 가입 확인 모달 */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onConfirm={handleMeetingJoin}
            title="모임에 가입하시겠습니까?"
          />
        </>
      )}
    </div>
  );
};

export default MeetingHome;
