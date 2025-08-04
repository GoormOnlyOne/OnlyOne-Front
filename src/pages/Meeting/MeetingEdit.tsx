import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MeetingForm, { type InitialData } from '../../components/domain/meeting/MeetingForm';

export const MeetingEdit = () => {
  const { id } = useParams();
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetingData() {
      try {
        const mockData: InitialData = {
          meetingName: '시니어 개발자 모임',
          introduction: '백엔드부터 프론트까지!',
          profileImage: 'https://img.hankyung.com/photo/202409/01.37085530.1.jpg',
          capacity: 10,
          accountNumber: '12345678901234',
          address: {
            city: '서울특별시',
            district: '강남구',
            isComplete: true,
          },
        };
        setInitialData(mockData);
      } catch (error) {
        console.error('모임 정보 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMeetingData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>;
  if (!initialData) return <div className="p-8 text-center">모임 데이터를 불러올 수 없습니다.</div>;

  return (
    <MeetingForm
      mode="edit"
      initialData={initialData}
      onSubmit={(data, address) => {
        console.log('Edit 요청', data, address);
        // 실제 API 요청 처리
      }}
    />
  );
};

export { MeetingEdit as default } from './MeetingEdit';
