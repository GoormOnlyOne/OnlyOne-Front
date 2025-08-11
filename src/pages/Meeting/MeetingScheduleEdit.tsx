import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ScheduleForm,
  type ScheduleFormData,
  type InitialData,
} from '../../components/domain/meeting/ScheduleForm';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';
import apiClient from '../../api/client';
import Loading from '../../components/common/Loading';

export const MeetingScheduleEdit = () => {
  const navigate = useNavigate();
  const { meetingId, scheduleId } = useParams<{
    meetingId: string;
    scheduleId: string;
  }>();
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingSchedule = async () => {
      try {
        const response = await apiClient.get(
          `/clubs/${meetingId}/schedules/${scheduleId}`,
        );

        if (response.success) {
          const data = response.data;
          const scheduleDate = new Date(data.scheduleTime);

          setInitialData({
            meetingName: data.name,
            meetingDate: scheduleDate.toISOString().split('T')[0],
            meetingTime: scheduleDate.toTimeString().slice(0, 5),
            location: data.location,
            costPerPerson: data.cost,
            userLimit: data.userLimit,
          });
        }
      } catch (error) {
        console.error('정모 데이터 로드 실패:', error);
        showApiErrorToast(error);
        navigate(`/meeting/${meetingId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingSchedule();
  }, [meetingId, scheduleId, navigate]);

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      const payload = {
        name: data.meetingName,
        location: data.location,
        cost: data.costPerPerson,
        userLimit: data.userLimit,
        scheduleTime: new Date(
          `${data.meetingDate}T${data.meetingTime}`,
        ).toISOString(),
      };

      const response = await apiClient.patch<{
        success: boolean;
        data: { scheduleId: number };
      }>(`/clubs/${meetingId}/schedules/${scheduleId}`, payload);

      if (response.success) {
        globalToast('정기 모임이 수정되었습니다.', 'success', 2000);
        navigate(`/meeting/${meetingId}`);
      }
    } catch (error) {
      showApiErrorToast(error);
      console.error('정모 수정 실패:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiClient.delete<{
        success: boolean;
      }>(`/clubs/${meetingId}/schedules/${scheduleId}`);

      if (response.success) {
        globalToast('정기 모임이 삭제되었습니다.', 'success', 2000);
        navigate(`/meeting/${meetingId}`);
      }
    } catch (error) {
      showApiErrorToast(error);
      console.error('정모 삭제 실패:', error);
    }
  };

  if (loading) {
    // ★ 변경: 공통 로딩 컴포넌트 사용
    return (
      <div className="relative min-h-[50vh]">
        <Loading overlay text="로딩 중..." />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">정모를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <ScheduleForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MeetingScheduleEdit;
