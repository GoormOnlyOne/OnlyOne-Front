import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 페이드인 효과
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleKakaoLogin = () => {
    setIsLoading(true);
    // TODO: 카카오 로그인 로직

    // 현재는 누르면 회원가입 페이지로 이동하게 처리함
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 overflow-hidden">
      {/* 로고 영역 */}
      <div
        className={`flex-1 flex items-center justify-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center">
          {/* 아이콘 + 텍스트 조합 */}
          <div className="mb-4">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <i className="ri-group-fill text-white text-5xl"></i>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">벗킷</h1>
          <p className="text-gray-600 text-sm">함께하는 즐거움, 새로운 만남</p>
        </div>
      </div>

      {/* 로그인 버튼 영역 */}
      <div
        className={`w-full max-w-sm pb-16 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#F9D71C] text-black font-medium py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.612 1.85 4.893 4.625 6.163-.203.72-.73 2.6-.835 3-.131.502.184.52.388.378.16-.11 2.55-1.697 3.57-2.385.397.056.815.094 1.252.094 5.523 0 10-3.477 10-7.75S17.523 3 12 3z" />
              </svg>
              <span>카카오 로그인</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export { Login as default } from './Login';
