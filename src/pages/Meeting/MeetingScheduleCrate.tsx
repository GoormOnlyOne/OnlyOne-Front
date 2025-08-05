// import { useNavigate } from 'react-router-dom';
import {
  ScheduleForm,
  type ScheduleFormData,
} from '../../components/domain/meeting/ScheduleForm';

export const MeetingScheduleCreate = () => {
  // const navigate = useNavigate();

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      console.log('정모 생성:', data);
      // TODO: API 호출하여 정모 생성
      // const response = await createMeetingSchedule(data);

      // 성공 시 목록 페이지로 이동
      // navigate('/meeting-schedules');

      alert('정모가 생성되었습니다!');
    } catch (error) {
      console.error('정모 생성 실패:', error);
      alert('정모 생성에 실패했습니다.');
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
