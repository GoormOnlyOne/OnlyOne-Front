import { useNavigate } from 'react-router-dom';

export default function CreateMeetingCard() {
  const navigate = useNavigate();

  const createMeeting = () => {
    navigate('/meeting/create');
  };

  return (
    <div className="bg-gradient-to-br from-[#F5921F] via-[#EF7C30] to-[#FFAE00] rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
      {/* 배경 장식 애니메이션 */}
      <div className="absolute -top-1 -right-1 w-12 h-12 bg-white/20 rounded-full blur-md animate-pulse"></div>
      <div
        className="absolute -bottom-1 -left-1 w-14 h-14 bg-white/10 rounded-full blur-lg animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="text-white relative z-10">
        <div className="text-3xl mb-2 animate-bounce">🤝</div>
        <h2 className="text-lg font-bold mb-1.5 leading-snug">
          함께하는 즐거움, 새로운 만남
        </h2>
        <p className="text-sm opacity-90 mb-3 leading-relaxed">
          벗킷에서 당신만의 모임을 만들어보세요
        </p>
        <button
          className="bg-white text-[#F5921F] text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-md"
          onClick={createMeeting}
        >
          ✨ 모임 만들기
        </button>
      </div>
    </div>
  );
}
