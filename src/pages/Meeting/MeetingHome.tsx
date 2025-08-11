import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';
import ScheduleList from '../../components/domain/meeting/ScheduleList';
import apiClient from '../../api/client';
import Modal from '../../components/common/Modal';
import { Settings, Plus, MapPin, Users, Tag } from 'lucide-react';
import Loading from '../../components/common/Loading';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // GUEST용 가입하기 버튼
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
      const res = await apiClient.post<{ success: boolean }>(
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
      <div className="relative min-h-[50vh]">
        <Loading overlay text="로딩 중..." />
      </div>
    );
  }

  if (!meeting) {
    return <div className="text-center">모임을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="px-4 pb-20">
      {/* 대표 이미지 */}
      <div className="w-full h-48 bg-gray-400 rounded-2xl mb-6 overflow-hidden shadow-sm">
        {meeting.image ? (
          <img
            src={meeting.image}
            alt={meeting.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-white text-lg font-medium">
              사진이 들어갑니다
            </span>
          </div>
        )}
      </div>

      {/* 모임 정보 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          {meeting.title}
        </h2>

        <div className="space-y-2 mb-4 ml-0">
          {/* 모임 메타 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{meeting.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            <span>{meeting.category}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>멤버 {meeting.participantCount}명</span>
          </div>
        </div>

        {/* 모임 소개 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {/* 스케줄 정보 */}
                <h3 className="font-semibold text-gray-800 mb-1">모임 소개</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {meeting.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리더 전용 버튼 */}
      {meeting.role === 'LEADER' && (
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/meeting/${meeting.id}/edit`)}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
              모임 정보 수정
            </button>
            <button
              onClick={() => navigate(`/meeting/${meeting.id}/schedule/create`)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#F5921F] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#EF7C30] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              정기모임 추가
            </button>
          </div>
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
                bg-[#F5921F] text-white text-lg font-bold
                rounded-xl shadow-lg
                hover:bg-[#EF7C30] active:scale-95
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
