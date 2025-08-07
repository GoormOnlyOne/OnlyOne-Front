import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  ScheduleForm,
  type ScheduleFormData,
} from '../../components/domain/meeting/ScheduleForm';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';

export const MeetingScheduleCreate = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

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

      const response = await apiClient.post<{
        success: boolean;
        data: { scheduleId: number };
      }>(`/clubs/${meetingId}/schedules`, payload);

      if (response.success) {
        globalToast('정기 모임이 생성되었습니다.', 'success', 2000);
        navigate(`/meeting/${meetingId}`);
      }
    } catch (err: any) {
      showApiErrorToast(err);
      console.error('정모 생성 실패 실패:', err);
      navigate(`/meeting/${meetingId}/schedules`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <ScheduleForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default MeetingScheduleCreate;
