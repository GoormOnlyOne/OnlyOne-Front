import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import Modal from '../../common/Modal';
import apiClient from '../../../api/client';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../common/Toast/ToastProvider';

export interface Schedule {
  scheduleId: number;
  name: string;
  scheduleStatus: string;
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

interface ScheduleListProps {
  clubRole: 'LEADER' | 'MEMBER' | 'GUEST';
}

export default function ScheduleList({ clubRole }: ScheduleListProps) {
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
  const [modalAction, setModalAction] = useState<
    'join' | 'leave' | 'settlement' | ''
  >('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!meetingId) return;

      try {
        setLoading(true);
        const response = await apiClient.get<ScheduleListResponse>(
          `/clubs/${meetingId}/schedules`,
        );

        console.log(response);

        if (response.success) {
          setSchedules(response.data); // response.data만 전달
        }
      } catch (err: unknown) {
        console.error('정기모임 목록 조회 실패:', err);
        setError(
          (err as Error).message || '정기모임 목록을 불러오는데 실패했습니다.',
        );
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

  const getStatusBadge = (scheduleStatus: string) => {
    switch (scheduleStatus) {
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

  const getStatusText = (scheduleStatus: string) => {
    switch (scheduleStatus) {
      case 'READY':
        return '모집중';
      case 'ENDED':
        return '종료됨';
      case 'SETTLING':
        return '정산중';
      case 'CLOSED':
        return '정산완료';
      default:
        return scheduleStatus;
    }
  };

  const handleStatusClick = (schedule: Schedule) => {
    const isSettlement =
      schedule.scheduleStatus === 'ENDED' ||
      schedule.scheduleStatus === 'SETTLING';
    const type = isSettlement ? 'settlement' : 'participation';

    navigate(
      `/meeting/${meetingId}/schedule/${schedule.scheduleId}/participation?type=${type}`,
    );
  };

  const getParticipationStatus = (schedule: Schedule) => {
    const isGuest = clubRole === 'GUEST';
    const isSettlement =
      schedule.scheduleStatus === 'ENDED' ||
      schedule.scheduleStatus === 'SETTLING';
    const buttonText = isSettlement ? '정산 현황' : '참여 현황';
    const buttonClass = isSettlement
      ? 'bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer'
      : 'bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer';

    return (
      <button
        onClick={() => {
          if (!isGuest) {
            handleStatusClick(schedule);
          }
        }}
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
      setSelectedSchedule(schedule);
      setModalAction('settlement');
      setIsModalOpen(true);
      setModalTitle(`${schedule.name} 정산을 요청하시겠습니까?`);
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
        await apiClient.patch(
          `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/users`,
        );
        globalToast('정기 모임에 참여하였습니다.', 'success', 2000);
      } else if (modalAction === 'leave') {
        // 나가기 API 호출
        await apiClient.delete(
          `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/users`,
        );
        globalToast('정기 모임을 나갔습니다.', 'success', 2000);
      } else if (modalAction === 'settlement') {
        // 정산하기 API 호출 (리더/멤버, 상태별로 분기)
        if (
          clubRole === 'LEADER' &&
          selectedSchedule.scheduleStatus === 'SETTLING'
        ) {
          // 리더가 SETTLING 상태에서 정산하기: 새로운 API
          await apiClient.post(
            `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/settlements/user`,
          );
          globalToast('정산 요청을 보냈습니다.', 'success', 2000);
        } else {
          // 그 외(ENDED 등): 기존 API
          await apiClient.post(
            `/clubs/${meetingId}/schedules/${selectedSchedule.scheduleId}/settlements`,
          );
          globalToast('정산 요청을 보냈습니다.', 'success', 2000);
        }
      }
    } catch (err: unknown) {
      console.error('정기모임 참여/나가기/정산 실패:', err);
      showApiErrorToast(err);
    } finally {
      const response = await apiClient.get<ScheduleListResponse>(
        `/clubs/${meetingId}/schedules`,
      );
      setSchedules(response.data); // response.data만 전달
      setIsModalOpen(false);
      setSelectedSchedule(null);
      setModalAction('');
    }
  };

  const getActionButton = (schedule: Schedule) => {
    // 게스트는 버튼 없음
    if (clubRole === 'GUEST') return null;

    // 리더
    if (clubRole === 'LEADER') {
      if (schedule.scheduleStatus === 'READY') {
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
      }
      if (schedule.scheduleStatus === 'ENDED') {
        // 리더 && ENDED: 정산하기(빨간색, 활성화)
        return (
          <button
            onClick={() => handleActionClick('정산하기', schedule)}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            정산하기
          </button>
        );
      }
      if (schedule.scheduleStatus === 'SETTLING') {
        // 리더 && SETTLING: 정산하기(회색, 활성화)
        return (
          <button
            onClick={() => handleActionClick('정산하기', schedule)}
            className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-500 transition-colors cursor-pointer"
          >
            정산하기
          </button>
        );
      }
      if (schedule.scheduleStatus === 'CLOSED') {
        // 리더 && CLOSED: 정산하기(회색, 비활성화)
        return (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium cursor-not-allowed"
          >
            정산하기
          </button>
        );
      }
    }
    // 멤버
    if (clubRole === 'MEMBER') {
      if (schedule.scheduleStatus === 'READY') {
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
      }
      if (
        schedule.scheduleStatus === 'ENDED' ||
        schedule.scheduleStatus === 'SETTLING' ||
        schedule.scheduleStatus === 'CLOSED'
      ) {
        // 멤버 && ENDED/SETTLING/CLOSED: 정산하기(회색, 비활성화)
        return (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium cursor-not-allowed"
          >
            정산하기
          </button>
        );
      }
    }
    return null;
  };

  const handleScheduleEdit = (scheduleId: number) => {
    if (!meetingId) return;
    navigate(`/meeting/${meetingId}/schedule/${scheduleId}/edit`);
  };

  // handleScheduleDelete 임시 구현 추가
  const handleScheduleDelete = (scheduleId: number) => {
    // TODO: 실제 삭제 로직 구현 필요
    globalToast('삭제 기능은 아직 구현되지 않았습니다.', 'info', 2000);
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
                    {/* 스케줄 정보 */}
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
                  <div className="flex items-center gap-2">
                    {/* 디데이와 상태 뱃지를 왼쪽으로 배치 */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDdayColor(schedule.dday)}`}
                    >
                      {schedule.dday}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(schedule.scheduleStatus)}`}
                    >
                      {getStatusText(schedule.scheduleStatus)}
                    </span>

                    {/* 리더에게만 보이는 더보기 아이콘 */}
                    {clubRole === 'LEADER' && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === schedule.scheduleId
                                ? null
                                : schedule.scheduleId,
                            )
                          }
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* 드롭다운 메뉴*/}
                        {openMenuId === schedule.scheduleId && (
                          <div
                            className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-50"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <button
                              onClick={() =>
                                handleScheduleEdit(schedule.scheduleId)
                              }
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                handleScheduleDelete(schedule.scheduleId)
                              }
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
