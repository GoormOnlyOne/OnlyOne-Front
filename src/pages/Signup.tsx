import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1 from '../components/domain/signup/Step1';
import Step2 from '../components/domain/signup/Step2';
import Step3 from '../components/domain/signup/Step3';
import SignupComplete from '../components/domain/signup/Complete';
import type { AddressData } from '../components/common/AddressSelector';

export const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | undefined>();
  const [formData, setFormData] = useState({
    categories: [] as string[],
    nickname: '',
    gender: '',
    birth: '',
    profileImage: '',
    address: {} as AddressData
  });

  const totalSteps = 3;

  // Step별 '다음' 버튼 활성화 조건 체크 함수
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // Step 1: 카테고리가 1개 이상 선택되어야 함
        return selectedCategories.length >= 1;
      case 2:
        // Step 2: 지역 선택
        return selectedAddress !== undefined && Object.keys(selectedAddress).length > 0;
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
      // 각 Step에서 다음으로 넘어갈 때 데이터 저장
      if (currentStep === 1) {
        setFormData(prev => ({
          ...prev,
          categories: selectedCategories
        }));
      } else if (currentStep === 2) {
        setFormData(prev => ({
          ...prev,
          address: selectedAddress!
        }));
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // 회원가입 완료 처리
      const finalData = {
        ...formData,
        categories: selectedCategories,
        address: selectedAddress
      };
      console.log('회원가입 데이터:', finalData);
      // TODO: API 호출하여 회원가입 처리
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

  // 주소 선택 핸들러
  const handleAddressChange = (address: AddressData) => {
    setSelectedAddress(address);
  };

  // Step 3 폼 데이터 핸들러
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 프로필 이미지 변경 핸들러
  // const handleProfileImageChange = (imageUrl: string) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     profileImage: imageUrl
  //   }));
  // };

  // 회원가입 완료 핸들러
  const handleSignupComplete = () => {
    navigate('/');
  };

  // 상단 스탭 컴포넌트
  const Stepper = () => {
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

  return (
    <div className="min-h-screen w-full max-w-md bg-white rounded-2xl p-8">
      <Stepper />
      
      {/* Step별 콘텐츠 */}
      <div className="mb-8">
        {currentStep === 1 && (
          <Step1 
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            maxSelection={5}
          />
        )}
        {currentStep === 2 && (
          <Step2 
            selectedAddress={selectedAddress}
            onAddressChange={handleAddressChange}
          />
        )}
        {currentStep === 3 && (
          <Step3 
            formData={formData}
            onFormChange={handleFormChange}
            // onProfileImageChange={handleProfileImageChange} // ProfileImageUpload의 실제 props 확인 필요
          />
        )}
        {currentStep === 4 && (
          <SignupComplete 
            onComplete={handleSignupComplete}
            welcomePoints={100000}
          />
        )}
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
            disabled={!isStepValid()}
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