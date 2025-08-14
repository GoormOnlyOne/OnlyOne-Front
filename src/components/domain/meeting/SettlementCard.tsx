import { useNavigate } from 'react-router-dom';

export default function SettlementCard() {
  const navigate = useNavigate();

  const onNavigateToSettlement = () => {
    navigate('/mypage/my-meetings', { state: { activeTab: 'mySettlement' } });
  };

  return (
    <div className="bg-gradient-to-br from-brand-light via-brand-soft to-brand-warm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.015] relative overflow-hidden border border-brand-warm/30">
      {/* 배경 장식 애니메이션 */}
      {/* <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/30 rounded-full animate-ping"></div>
      <div
        className="absolute top-1 right-1 w-4 h-4 bg-white/40 rounded-full animate-ping"
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div
        className="absolute -bottom-1 -left-1 w-12 h-12 bg-white/20 rounded-full blur-md animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div> */}

      <div className="text-brand-deepest relative z-10">
        <div
          className="text-3xl mb-2 animate-bounce"
          style={{ animationDelay: '0.2s' }}
        >
          💰
        </div>
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <h2 className="text-lg font-bold leading-snug">
            정산 대기 중인 모임이 있어요
          </h2>
        </div>
        <p className="text-sm opacity-90 mb-3 leading-relaxed">
          아직 정산하지 않은 정기 모임을 확인해보세요
        </p>
        <button
          className="bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-secondary transform hover:scale-[1.015] transition-all duration-200 shadow-md relative overflow-hidden"
          onClick={onNavigateToSettlement}
        >
          <span className="relative z-10">⚡ 정산하러 가기</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );
}
