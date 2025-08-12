import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1 from '../../components/domain/signup/Step1';
import Step2 from '../../components/domain/signup/Step2';
import Step3 from '../../components/domain/signup/Step3';
import type { AddressData } from '../../components/common/AddressSelector';
import { getUserProfile, updateUserProfile } from '../../api/user';
import type {
  ProfileResponse,
  ProfileUpdateRequest,
} from '../../types/endpoints/user.api';
import { useToast } from '../../components/common/Toast/ToastContext';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

export const Profile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    city: '',
    district: '',
    isComplete: false,
  });
  const [formData, setFormData] = useState({
    categories: [] as string[],
    nickname: '',
    gender: '',
    birth: '',
    profileImage: '',
    address: {
      city: '',
      district: '',
      isComplete: false,
    },
  });

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // 소문자 관심사를 대문자로 변환하는 함수
  const mapInterestsToCategories = (interests: string[]): string[] => {
    if (!interests || !Array.isArray(interests)) {
      return [];
    }

    const interestMap: { [key: string]: string } = {
      culture: 'CULTURE',
      exercise: 'EXERCISE',
      travel: 'TRAVEL',
      music: 'MUSIC',
      craft: 'CRAFT',
      social: 'SOCIAL',
      language: 'LANGUAGE',
      finance: 'FINANCE',
    };

    return interests.map(
      interest => interestMap[interest.toLowerCase()] || interest.toUpperCase(),
    );
  };

  // 대문자 카테고리를 소문자로 변환하는 함수 (저장 시 사용)
  const mapCategoriesToInterests = (categories: string[]): string[] => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }

    const categoryMap: { [key: string]: string } = {
      CULTURE: 'culture',
      EXERCISE: 'exercise',
      TRAVEL: 'travel',
      MUSIC: 'music',
      CRAFT: 'craft',
      SOCIAL: 'social',
      LANGUAGE: 'language',
      FINANCE: 'finance',
    };

    return categories.map(
      category => categoryMap[category.toUpperCase()] || category.toLowerCase(),
    );
  };

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setProfileData(profile);

        // 폼 데이터 초기화
        const address = {
          city: profile.city,
          district: profile.district,
          isComplete: true,
        };

        // 소문자 관심사를 대문자 카테고리로 변환
        const mappedCategories = mapInterestsToCategories(
          profile.interestsList,
        );

        setSelectedCategories(mappedCategories);
        setSelectedAddress(address);
        setFormData({
          categories: mappedCategories,
          nickname: profile.nickname,
          gender: profile.gender,
          birth: profile.birth,
          profileImage: profile.profileImage,
          address,
        });
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        showToast('프로필 정보를 불러오는데 실패했습니다.', 'error');
        navigate('/mypage');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, showToast]);

  const totalSteps = 3;

  // Step별 '다음' 버튼 활성화 조건 체크 함수
  const isStepValid = () => {
    // 로딩 중이거나 데이터가 없으면 비활성화
    if (loading || !profileData) {
      return false;
    }

    switch (currentStep) {
      case 1:
        // Step 1: 카테고리가 1개 이상 선택되어야 함
        return selectedCategories && selectedCategories.length >= 1;
      case 2:
        // Step 2: 지역 선택 (도시와 구/군이 모두 선택되어야 함)
        return (
          selectedAddress !== undefined &&
          selectedAddress.city !== '' &&
          selectedAddress.district !== '' &&
          selectedAddress.isComplete === true
        );
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
  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // 각 Step에서 다음으로 넘어갈 때 데이터 저장
      if (currentStep === 1) {
        setFormData(prev => ({
          ...prev,
          categories: selectedCategories,
        }));
      } else if (currentStep === 2) {
        setFormData(prev => ({
          ...prev,
          address: selectedAddress!,
        }));
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // 프로필 수정 완료 처리
      try {
        if (!profileData) {
          showToast('프로필 정보가 없습니다.', 'error');
          return;
        }

        const updateData: ProfileUpdateRequest = {
          userId: profileData.userId,
          nickname: formData.nickname,
          birth: formData.birth,
          status: profileData.status,
          profileImage: formData.profileImage,
          gender: formData.gender as 'MALE' | 'FEMALE',
          city: selectedAddress.city,
          district: selectedAddress.district,
          interestsList: mapCategoriesToInterests(selectedCategories),
        };

        setLoading(true);
        await updateUserProfile(updateData);
        showToast('프로필이 성공적으로 수정되었습니다.', 'success');
        navigate('/mypage');
      } catch (error) {
        console.error('프로필 수정 실패:', error);
        showToast('프로필 수정에 실패했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // 이전 버튼
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    setAlertMsg('수정사항을 저장하지 않고 나가시겠습니까?');
    setIsAlertOpen(true);
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
      [field]: value,
    }));
  };

  // 프로필 이미지 변경 핸들러
  const handleProfileImageChange = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageUrl,
    }));
  };

  // 상단 스탭 컴포넌트
  const Stepper = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300
                ${
                  currentStep >= step
                    ? 'bg-[var(--color-brand-primary)] text-white hover:bg-[color-mix(in srgb, var(--color-brand-primary) 90%, black)]'
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
                  ${currentStep > step ? 'bg-[var(--color-brand-primary)] text-white hover:bg-[color-mix(in srgb, var(--color-brand-primary) 90%, black)]' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const loadingText = profileData
    ? '처리 중...'
    : '로딩 중...';

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6 md:px-8 lg:max-w-2xl lg:mx-auto">
      {loading && <Loading overlay text={loadingText} />}

      <Stepper />

      {/* Step별 콘텐츠 */}
      <div className="mb-8">
        {currentStep === 1 && (
          <Step1
            selectedCategories={selectedCategories || []}
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
            onProfileImageChange={handleProfileImageChange}
          />
        )}
      </div>

      {/* 이전/다음/취소 Buttons */}
      <div className="flex gap-3">
        {currentStep === 1 && (
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
        )}

        {currentStep > 1 && (
          <button
            onClick={handlePrev}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            이전
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!isStepValid() || loading}
          className={`
    flex-1 px-6 py-3 rounded-lg font-medium transition-colors
    bg-[var(--color-brand-primary)] text-white hover:bg-[color-mix(in srgb, var(--color-brand-primary) 90%, black)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${!isStepValid() || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
  `}
        >
          {loading
            ? '처리 중...'
            : currentStep === totalSteps
              ? '수정완료'
              : '다음'}
        </button>
      </div>

      <Modal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => {
          setIsAlertOpen(false);
          navigate('/mypage');
        }}
        title={alertMsg}
        cancelText="취소"
        confirmText="나가기"
        variant="default"
      />
    </div>
  );
};

export default Profile;
