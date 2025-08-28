import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MeetingForm, {
  type InitialData,
  type Category,
  type SubmittedData,
} from '../../components/domain/meeting/MeetingForm';
import { type AddressData } from '../../components/common/AddressSelector';
import apiClient from '../../api/client';
import { uploadImage } from '../../api/upload';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';
import Loading from '../../components/common/Loading';

export const MeetingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetingData() {
      try {
        setLoading(true);
        const response = await apiClient.get(`/clubs/${id}`);

        if (response.success) {
          const data = response.data;

          setInitialData({
            category: (data.category as Category) ?? 'CULTURE',
            meetingName: data.name,
            introduction: data.description,
            profileImage: data.clubImage,
            userLimit: data.userLimit,
            address: {
              city: data.city || '서울특별시',
              district: data.district,
              isComplete: true,
            },
          });
        }
      } catch (error) {
        console.error('모임 정보 불러오기 실패:', error);
        showApiErrorToast(error);
        navigate('/meeting');
      } finally {
        setLoading(false);
      }
    }

    fetchMeetingData();
  }, [id, navigate]);

  const handleSubmit = async (data: SubmittedData, address: AddressData) => {
    try {
      let clubImageUrl = '';

      // 새로운 이미지 파일이 있는 경우 S3에 업로드
      if (data.profileImage && data.profileImage instanceof File) {
        try {
          clubImageUrl = await uploadImage(data.profileImage, 'club');
          console.log('이미지 업로드 성공:', clubImageUrl);
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          showApiErrorToast(uploadError);
          return;
        }
      } else if (typeof data.profileImage === 'string') {
        // 기존 이미지 URL이 있는 경우 그대로 사용
        clubImageUrl = data.profileImage;
      } else if (data.profileImageUrl) {
        // profileImageUrl에서 기존 이미지 URL 가져오기
        clubImageUrl = data.profileImageUrl;
      }

      const payload = {
        name: data.meetingName,
        userLimit: data.userLimit,
        description: data.introduction,
        clubImage: clubImageUrl,
        category: data.category || 'CULTURE',
        city: address.city,
        district: address.district,
      };

      const response = await apiClient.patch(`/clubs/${id}`, payload);

      if (response.success) {
        globalToast('모임이 수정되었습니다.', 'success', 2000);
        navigate(`/meeting/${id}`);
      }
    } catch (error) {
      showApiErrorToast(error);
      console.error('모임 수정 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[50vh]">
        <Loading overlay text="불러오는 중..." />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-8 text-center">모임 데이터를 불러올 수 없습니다.</div>
    );
  }

  return (
    <MeetingForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
};

export { MeetingEdit as default } from './MeetingEdit';
