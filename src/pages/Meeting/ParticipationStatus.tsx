import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import ParticipantInfo from '../../components/domain/meeting/ParticipantInfo';
import apiClient from '../../api/client';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import Loading from '../../components/common/Loading';

interface ParticipatorResponse {
  userId: number;
  nickname: string;
  profileImage: string | null;
}

interface SettlementResponse {
  userId: number;
  nickname: string;
  profileImage: string | null;
  settlementStatus: 'REQUESTED' | 'COMPLETED' | 'FAILED';
}

interface Participator {
  userId: number;
  nickname: string;
  profileImage: string | null;
}

interface Settlement {
  userId: number;
  nickname: string;
  profileImage: string | null;
  settlementStatus: 'REQUESTED' | 'COMPLETED' | 'FAILED';
}

type ParticipatorsApi = { success: boolean; data: ParticipatorResponse[] };
type SettlementsApi = {
  success: boolean;
  data: { userSettlementList: SettlementResponse[] };
};

export const ParticipationStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type =
    (searchParams.get('type') as 'participation' | 'settlement') ??
    'participation';
  const { meetingId, scheduleId } = useParams<{
    meetingId: string;
    scheduleId: string;
  }>();

  const [participants, setParticipants] = useState<Participator[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId || !scheduleId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (type === 'settlement') {
          // ★ 변경: 제네릭 및 데이터 경로 정합성 수정
          const res = await apiClient.get<SettlementsApi>(
            `/clubs/${meetingId}/schedules/${scheduleId}/settlements`,
          );
          if (!res.success) throw new Error('정산 목록 조회 실패');
          const data = res.data?.data?.userSettlementList || [];
          const transformed: Settlement[] = (data ?? []).map(
            ({ userId, nickname, profileImage, settlementStatus }: SettlementResponse) => ({
              userId,
              nickname,
              profileImage,
              settlementStatus,
            }),
          );
          setSettlements(transformed);
        } else {
          // 참여자 리스트 조회
          const res = await apiClient.get<ParticipatorResponse[]>(
            `/clubs/${meetingId}/schedules/${scheduleId}/users`,
          );
          const data = res.data;
          const transformed: Participator[] = data.map(
            ({ userId, nickname, profileImage }) => ({
              userId,
              nickname,
              profileImage,
            }),
          );
          setParticipants(transformed);
        }
      } catch (err: any) {
        showApiErrorToast(err);
        console.error('데이터를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId, scheduleId, type]);

  if (loading) {
    // ★ 변경: 공통 로딩 컴포넌트 사용
    return (
      <div className="relative min-h-[40vh]">
        <Loading overlay text="불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {type === 'settlement'
          ? settlements.map(s => (
              <ParticipantInfo
                key={s.userId}
                nickname={s.nickname}
                profileImage={s.profileImage}
                settlementStatus={s.settlementStatus}
              />
            ))
          : participants.map(p => (
              <ParticipantInfo
                key={p.userId}
                nickname={p.nickname}
                profileImage={p.profileImage}
              />
            ))}
      </div>
    </div>
  );
};

export default ParticipationStatus;
