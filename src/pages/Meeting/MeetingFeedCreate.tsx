import { useParams, useNavigate } from 'react-router-dom';
import MeetingFeedForm from '../../components/domain/meeting/MeetingFeedForm';
import apiClient from '../../api/client';

interface MeetingFeedFormData {
  feedUrls: string[];
  content: string;
}

const MeetingFeedCreate = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (data: MeetingFeedFormData) => {
    // 피드 생성 API 호출
    try {
      console.log('Submitting feed data:', data);
      await apiClient.post(`/clubs/${meetingId}/feeds`, {
        feedUrls: data.feedUrls,
        content: data.content,
      });

      // 성공 시 모임 상세 페이지로 이동
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      console.error('피드 생성 실패:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <MeetingFeedForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default MeetingFeedCreate;
