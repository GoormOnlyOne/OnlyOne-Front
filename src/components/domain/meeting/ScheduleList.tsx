import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../common/Modal';
import apiClient from '../../../api/client';

export interface Schedule {
  scheduleId: number;
  name: string;
  status: string;
  scheduleTime: string;
  cost: number;
  userLimit: number;
  userCount: number;
  joined: boolean;
  leader: boolean;
  dday: string;
}

// API 응답 타입
interface ScheduleListResponse {
  success: boolean;
  data: Schedule[];
}

export default function ScheduleList() {
  const navigate = useNavigate();
  const { id: meetingId } = useParams();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [modalAction, setModalAction] = useState<'join' | 'leave' | ''>('');

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!meetingId) return;

      try {
        setLoading(true);
        const response = await apiClient.get<ScheduleListResponse>(
          `/clubs/${meetingId}/schedules`,
        );

        if (response.data.success) {
          setSchedules(response.data.data);
        }
      } catch (err: any) {
        console.error('정기모임 목록 조회 실패:', err);
        setError(err.message || '정기모임 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [meetingId]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDdayColor = (dday: string) => {
    if (dday === 'D-DAY') return 'bg-red-500 text-white';
    if (dday.startsWith('D-')) return 'bg-orange-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      case 'SETTLING':
        return 'bg-orange-100 text-orange-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return '모집중';
      case 'ENDED':
        return '종료됨';
      case 'SETTLING':
        return '정산중';
      case 'CLOSED':
        return '정산완료';
      default:
        return status;
    }
  };

  const handleStatusClick = (schedule: Schedule) => {
    const isSettlement =
      schedule.status === 'ENDED' || schedule.status === 'SETTLING';
    const type = isSettlement ? 'settlement' : 'participation';

    navigate(
      `/meeting/${meetingId}/schedule/${schedule.scheduleId}/participation?type=${type}`,
    );
  };

  const getParticipationStatus = (schedule: Schedule) => {
    const isSettlement =
      schedule.status === 'ENDED' || schedule.status === 'SETTLING';
    const buttonText = isSettlement ? '정산 현황' : '참여 현황';
    const buttonClass = isSettlement
      ? 'bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer'
      : 'bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer';

    return (
      <button
        onClick={() => handleStatusClick(schedule)}
        className={buttonClass}
      >
        {buttonText} ({schedule.userCount}/
        {schedule.userLimit === 0 ? '무제한' : schedule.userLimit})
      </button>
    );
  };

  const handleActionClick = (action: string, schedule: Schedule) => {
    console.log(`Action clicked: ${action}`, schedule);

    if (action === '참여하기') {
      setSelectedSchedule(schedule);
      setModalAction('join');
      setIsModalOpen(true);
      setModalTitle(`${schedule.name}에 참여 하시겠습니까?`);
    } else if (action === '정산하기') {
      // 정산하기 페이지 이동
      navigate(
        `/meeting/${meetingId}/schedule/${schedule.scheduleId}/settlement`,
      );
    } else {
      setSelectedSchedule(schedule);
      setModalAction('leave');
      setIsModalOpen(true);
      setModalTitle(`${schedule.name}에 나가시겠습니까?`);
    }
  };

  const handleModalCancel = () => {
    console.log('취소 버튼을 눌렀습니다.');
    setIsModalOpen(false);
    setSelectedSchedule(null);
    setModalAction('');
  };

  const handleModalConfirm = async () => {
    console.log('확인 버튼을 눌렀습니다.');

    if (!selectedSchedule || !meetingId) {
      setIsModalOpen(false);
      return;
    }

    try {
      if (modalAction === 'join') {
        // 참여 API 호출
        await apiClient.post(
          `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/join`,
        );

        // 성공 시 목록 새로고침
        const response = await apiClient.get<ScheduleListResponse>(
          `/clubs/${meetingId}/schedules`,
        );
        if (response.data.success) {
          setSchedules(response.data.data);
        }
      } else if (modalAction === 'leave') {
        // 나가기 API 호출
        await apiClient.delete(
          `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/leave`,
        );

        // 성공 시 목록 새로고침
        const response = await apiClient.get<ScheduleListResponse>(
          `/clubs/${meetingId}/schedules`,
        );
        if (response.data.success) {
          setSchedules(response.data.data);
        }
      }
    } catch (err: any) {
      console.error('정기모임 참여/나가기 실패:', err);
      alert(err.message || '요청 처리에 실패했습니다.');
    } finally {
      setIsModalOpen(false);
      setSelectedSchedule(null);
      setModalAction('');
    }
  };

  const getActionButton = (schedule: Schedule) => {
    switch (schedule.status) {
      case 'READY':
        if (schedule.joined) {
          return (
            <button
              onClick={() => handleActionClick('나가기', schedule)}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              나가기
            </button>
          );
        } else {
          return (
            <button
              onClick={() => handleActionClick('참여하기', schedule)}
              className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
            >
              참여하기
            </button>
          );
        }

      case 'ENDED':
      case 'SETTLING':
        if (schedule.joined) {
          return (
            <button
              onClick={() => handleActionClick('정산하기', schedule)}
              className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-500 transition-colors cursor-pointer"
            >
              정산하기
            </button>
          );
        }
        return null;

      case 'CLOSED':
        return null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold">정기 모임</h2>
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-500">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold">정기 모임</h2>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="font-bold">정기 모임</h2>
        {schedules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            등록된 정기모임이 없습니다.
          </div>
        ) : (
          schedules.map(schedule => (
            <div
              key={schedule.scheduleId}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {schedule.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {`일시 | ${formatDateTime(schedule.scheduleTime)}`}
                    </p>
                    <div className="text-sm text-gray-600">
                      <span>{`인당 비용 | ${schedule.cost === 0 ? '무료' : `${schedule.cost.toLocaleString()}₩`}`}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDdayColor(schedule.dday)}`}
                    >
                      {schedule.dday}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(schedule.status)}`}
                    >
                      {getStatusText(schedule.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getParticipationStatus(schedule)}
                    {getActionButton(schedule)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        title={modalTitle}
      />
    </>
  );
}
