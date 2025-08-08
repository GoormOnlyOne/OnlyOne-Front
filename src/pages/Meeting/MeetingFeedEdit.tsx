import { useState, useEffect } from 'react';
import MeetingFeedForm, {
  type InitialData,
  type SubmittedData,
} from '../../components/domain/meeting/MeetingFeedForm';
import apiClient from '../../api/client';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';

const MeetingFeedEdit = () => {
  const { meetingId, feedId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!meetingId || !feedId) return;

    const fetchFeedData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/clubs/${meetingId}/feeds/${feedId}`,
        );

        if (response.success) {
          const data = response.data;
          const urls: string[] = data.feedUrls ?? data.imageUrls ?? [];
          const nextInitialData: InitialData = {
            feedUrls: urls,
            content: data.content ?? '',
          };
          setInitialData(nextInitialData);
        } else {
          throw new Error('피드 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('피드 정보 불러오기 실패:', error);
        showApiErrorToast(error);
        navigate(`/meeting/${meetingId}/feed/${feedId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [meetingId, feedId, navigate]);

  const handleSubmit = async (submittedData: SubmittedData) => {
    if (!meetingId || !feedId) return;

    setSubmitting(true);
    try {
      // SubmittedData에서 필요한 데이터 추출
      const payload = {
        content: submittedData.content,
        feedUrls: submittedData.feedUrls || submittedData.imageUrls || [],
      };

      const response = await apiClient.patch(
        `/clubs/${meetingId}/feeds/${feedId}`,
        payload,
      );

      if (response.success) {
        globalToast('피드를 수정했습니다.', 'success', 2000);
        navigate(`/meeting/${meetingId}/feed/${feedId}`);
      } else {
        throw new Error('피드 수정에 실패했습니다.');
      }
    } catch (error) {
      showApiErrorToast(error);
      console.error('피드 수정 실패:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          피드 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-4">
        <div className="text-center text-red-500">
          피드 정보를 불러올 수 없습니다.
        </div>
        <button
          onClick={handleCancel}
          className="mt-4 w-full py-2 bg-gray-500 text-white rounded-lg"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <MeetingFeedForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={submitting}
    />
  );
};

export default MeetingFeedEdit;
