import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySection from '../../components/domain/category/CategorySection';
import AddressSelector from '../../components/common/AddressSelector';

export const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // 선택된 카테고리 상태 추가
  const [formData, setFormData] = useState({
    categories: [] as string[],
    nickname: '',
    gender: '',
    birth: '',
  });

  const totalSteps = 3;

  // Step별 '다음' 버튼 활성화 조건 체크 함수
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // Step 1: 카테고리가 1개 이상 선택되어야 함
        return selectedCategories.length >= 1;
      case 2:
        // Step 2: 지역 선택 (구현 필요)
        return true; // 임시로 true 반환
      case 3:
        // Step 3: 모든 필드가 채워져야 함
        return (
          formData.nickname !== '' &&
          formData.gender !== '' &&
          formData.birth !== ''
        );
      default:
        return false;
    }
  };

  // 다음 버튼
  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Step 1에서 Step 2로 넘어갈 때 선택된 카테고리를 formData에 저장
      if (currentStep === 1) {
        setFormData(prev => ({
          ...prev,
          categories: selectedCategories
        }));
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // 회원가입 완료 처리
      console.log('회원가입 데이터:', { ...formData, categories: selectedCategories });
      setCurrentStep(4); // 완료 화면
    }
  };

  // 이전 버튼
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategoryChange = (categories: string | string[]) => {
    if (Array.isArray(categories)) {
      setSelectedCategories(categories);
    }
  };

  // Step 3 폼 데이터 핸들러
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 상단 스탭 컴포넌트
  const Steper = () => {
    if (currentStep === 4) return null; // 완료 화면에서는 표시하지 않음
    
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`
                  w-16 h-1 mx-2 transition-all duration-300
                  ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step 1: 관심사 설정
  const Step1 = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">관심사 선택</h2>
      <p className="text-gray-600 text-center mb-2">
        최소 1개에서 최대 5개까지 선택할 수 있습니다.
      </p>
      {selectedCategories.length > 0 && (
        <p className="text-blue-600 text-center mb-6 font-medium">
          {selectedCategories.length}개 선택됨
        </p>
      )}
      <CategorySection 
        mode="multi-select" 
        onCategoryChange={handleCategoryChange}
        defaultSelected={selectedCategories}
        maxSelection={5} // 최대 선택 개수 전달
      />
    </div>
  );

  // Step 2: 지역 선택
  const Step2 = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">지역 선택</h2>
      <p className="text-gray-600 text-center mb-8">
        활동하실 지역을 선택해주세요
      </p>
      {/* 지역 선택 컴포넌트 구현 필요 */}
      <AddressSelector />
    </div>
  );

  // Step 3: 회원 정보 입력 폼
  const Step3 = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">정보 입력</h2>
      <p className="text-gray-600 text-center mb-8">
        벗킷에서 사용할 정보를 입력해주세요
      </p>
      
      <div className="space-y-6">
        {/* 닉네임 입력 */}
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-400 mr-1">*</span> 
            <span>닉네임</span>
          </label>
          <input
            type="text"
            id="nickname"
            value={formData.nickname}
            onChange={(e) => handleFormChange('nickname', e.target.value)}
            placeholder="닉네임을 입력해주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            최소 2자 이상 10자 이하, 특수문자 제외
          </p>
        </div>

        {/* 성별 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-400 mr-1">*</span> 
            <span>성별</span>
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                className="sr-only"
              />
              <div className={`
                w-full py-3 px-4 border rounded-lg text-center cursor-pointer transition-all
                ${formData.gender === 'male' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
              `}>
                남성
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                className="sr-only"
              />
              <div className={`
                w-full py-3 px-4 border rounded-lg text-center cursor-pointer transition-all
                ${formData.gender === 'female' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
              `}>
                여성
              </div>
            </label>
          </div>
        </div>

        {/* 생년월일 입력 */}
        <div>
          <label htmlFor="birth" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-400 mr-1">*</span> 
            <span>생년월일</span>
          </label>
          <input
            type="date"
            id="birth"
            value={formData.birth}
            onChange={(e) => handleFormChange('birth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            생년월일을 선택해주세요
          </p>
        </div>
      </div>
    </div>
  );

  // 회원가입 완료
  const CompletePage = () => (
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
          <p className="text-2xl font-bold text-yellow-600">100,000P</p>
          <p className="text-sm text-gray-600 mt-2">
            지금 바로 모임에서 사용해보세요!
          </p>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          시작하기
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-md bg-white rounded-2xl p-8">
      <Steper />
      
      {/* Step별 콘텐츠 */}
      <div className="mb-8">
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <CompletePage />}
      </div>
      
      {/* 이전/다음 Buttons */}
      {currentStep !== 4 && (
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isStepValid()} // 조건에 따라 비활성화
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-colors
              ${currentStep === totalSteps 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              ${!isStepValid() ? 'cursor-not-allowed' : ''}
            `}
          >
            {currentStep === totalSteps ? '가입완료' : '다음'}
          </button>
        </div>
      )}
    </div>
  );
};

export { Signup as default } from './Signup';