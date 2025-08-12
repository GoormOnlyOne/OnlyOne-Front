import { useNavigate } from 'react-router-dom';
import MeetingForm from '../../components/domain/meeting/MeetingForm';
import apiClient from '../../api/client';
import { uploadImage } from '../../api/upload';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';

export const MeetingCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: any, address: any) => {
    try {
      let clubImageUrl = '';

      // 이미지 파일이 있는 경우 S3에 업로드
      if (data.profileImage && data.profileImage instanceof File) {
        try {
          clubImageUrl = await uploadImage(data.profileImage, 'club');
          console.log('이미지 업로드 성공:', clubImageUrl);
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          showApiErrorToast(uploadError);
          return;
        }
      }

      const payload = {
        name: data.meetingName,
        userLimit: data.userLimit,
        description: data.introduction,
        clubImage: clubImageUrl,
        category: data.category || '기타',
        city: address.city,
        district: address.district,
      };

      console.log('모임 생성 페이로드:', payload);

      const response = await apiClient.post('/clubs', payload);
      console.log(response);

      if (response.success) {
        globalToast('모임이 생성되었습니다.', 'success', 2000);
        navigate(`/meeting/${response.data.clubId}`);
      }
    } catch (error) {
      showApiErrorToast(error);
      console.error('모임 생성 실패:', error);
    }
  };

  return <MeetingForm mode="create" onSubmit={handleSubmit} />;
};

export { MeetingCreate as default } from './MeetingCreate';