interface SignupCompleteProps {
  onComplete: () => void;
  welcomePoints?: number;
}

const SignupComplete = ({ onComplete, welcomePoints = 100000 }: SignupCompleteProps) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-check-line text-blue-600 text-6xl"></i>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">회원가입 완료!</h2>
        <p className="text-gray-600 mb-6">
          벗킷의 회원이 되신 것을 환영합니다
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 max-w-sm mx-auto">
          <div className="flex items-center justify-center mb-2">
            <i className="ri-gift-line text-yellow-600 text-2xl mr-2"></i>
            <span className="font-semibold text-lg">신규 가입 축하 포인트</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{welcomePoints.toLocaleString()}P</p>
          <p className="text-sm text-gray-600 mt-2">
            지금 바로 모임에서 사용해보세요!
          </p>
        </div>
        
        <button
          onClick={onComplete}
          className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default SignupComplete;