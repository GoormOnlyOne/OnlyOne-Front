import { useNavigate } from 'react-router-dom';

type SettlementCardProps = {
  onNavigateToSettlement?: () => void;
};

export default function SettlementCard({
  onNavigateToSettlement,
}: SettlementCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onNavigateToSettlement) {
      onNavigateToSettlement(); // 부모 콜백 호출
    } else {
      navigate('/my-meetings', { state: { activeTab: 'mySettlement' } });
    }
  };

  return (
    <div className="...">
      {/* ... */}
      <button onClick={handleClick}>⚡ 정산하러 가기</button>
    </div>
  );
}
