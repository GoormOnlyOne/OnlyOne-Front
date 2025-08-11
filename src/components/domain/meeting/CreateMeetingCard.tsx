import { useNavigate } from 'react-router-dom';

export default function CreateMeetingCard() {
  const navigate = useNavigate();

  const createMeeting = () => {
    navigate('/meeting/create');
  };

  return (
    <div className="bg-gradient-to-br from-[#F5921F] via-[#EF7C30] to-[#FFAE00] rounded-3xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
      {/* 배경 장식 애니메이션 */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/20 rounded-2xl-full blur-lg animate-pulse"></div>
      <div
        className="absolute -bottom-2 -left-2 w-20 h-20 bg-white/10 rounded-2xl blur-xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="text-white relative z-10">
        <div className="text-5xl mb-3 animate-bounce">🤝</div>
        <h2 className="text-2xl font-bold mb-2 leading-relaxed">
          함께하는 즐거움, 새로운 만남
        </h2>
        <p className="text-3sm opacity-90 mb-4 leading-relaxed">
          벗킷에서 당신만의 모임을 만들어보세요
        </p>
        <button
          className="bg-white text-[#F5921F] text-base font-bold px-6 py-2.5 rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          onClick={createMeeting}
        >
          ✨ 모임 만들기
        </button>
      </div>
    </div>
  );
}
