import { useSearchParams } from 'react-router';
import ParticipantInfo from '../../components/domain/meeting/ParticipantInfo';

export const ParticipationStatus = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'participation';

  // 더미 데이터 - 참여 현황
  const participationList = [
    { nickname: "홍길동", profileImage: null },
    { nickname: "김철수", profileImage: null },
    { nickname: "이영희", profileImage: null },
    { nickname: "박민수", profileImage: null }
  ];

  // 더미 데이터 - 정산 현황
  const settlementList = [
    { nickname: "홍길동", profileImage: null, settlementStatus: "REQUESTED" as const },
    { nickname: "김철수", profileImage: null, settlementStatus: "COMPLETED" as const },
    { nickname: "이영희", profileImage: null, settlementStatus: "FAILED" as const },
    { nickname: "박민수", profileImage: null, settlementStatus: "REQUESTED" as const }
  ];

  return (
    <>
      {/* Main Content */}
      <div className="p-4">
        {/* Participant List */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {type === 'settlement' ? (
            settlementList.map((participant, index) => (
              <ParticipantInfo
                key={index}
                nickname={participant.nickname}
                profileImage={participant.profileImage}
                settlementStatus={participant.settlementStatus}
              />
            ))
          ) : (
            participationList.map((participant, index) => (
              <ParticipantInfo
                key={index}
                nickname={participant.nickname}
                profileImage={participant.profileImage}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ParticipationStatus;