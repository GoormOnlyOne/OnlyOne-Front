import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ScheduleForm,
  type ScheduleFormData,
  type InitialData,
} from '../../components/domain/meeting/ScheduleForm';

export const MeetingScheduleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API에서 정모 데이터 가져오기
    const fetchMeetingSchedule = async () => {
      try {
        // const response = await getMeetingSchedule(id);
        // setInitialData(response.data);

        // 임시 데이터
        setInitialData({
          meetingName: '월간 독서 모임',
          meetingDate: '2025-08-15',
          meetingTime: '14:00',
          location: '강남역 스타벅스',
          costPerPerson: 5000,
          capacity: 10,
        });
      } catch (error) {
        console.error('정모 데이터 로드 실패:', error);
        alert('정모 정보를 불러올 수 없습니다.');
        navigate('/meeting-schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingSchedule();
  }, [id, navigate]);

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      console.log('정모 수정:', data);
      // TODO: API 호출하여 정모 수정
      // const response = await updateMeetingSchedule(id, data);

      // 성공 시 상세 페이지로 이동
      // navigate(`/meeting-schedules/${id}`);

      alert('정모가 수정되었습니다!');
    } catch (error) {
      console.error('정모 수정 실패:', error);
      alert('정모 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      console.log('정모 삭제');
      // TODO: API 호출하여 정모 삭제
      // await deleteMeetingSchedule(id);

      // 성공 시 목록 페이지로 이동
      // navigate('/meeting-schedules');

      alert('정모가 삭제되었습니다!');
    } catch (error) {
      console.error('정모 삭제 실패:', error);
      alert('정모 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
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
