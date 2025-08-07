import { useRef, useEffect, useState, type ChangeEvent } from 'react';
import CategorySection from '../../../components/domain/category/CategorySection';
import AddressSelector, {
  type AddressData,
} from '../../../components/common/AddressSelector';
import Modal from '../../common/Modal';

export type Category =
  | 'CULTURE'
  | 'EXERCISE'
  | 'TRAVEL'
  | 'MUSIC'
  | 'CRAFT'
  | 'SOCIAL'
  | 'LANGUAGE'
  | 'FINANCE'
  | 'ASDF';

export interface SubmittedData extends FormData {
  profileImageUrl?: string;
}

export interface FormData {
  category: Category;
  meetingName: string;
  introduction: string;
  profileImage: File | null;
  userLimit: number;
  accountNumber: string;
}

export interface InitialData {
  category?: Category;
  meetingName?: string;
  introduction?: string;
  profileImage?: string | File | null;
  userLimit?: number;
  accountNumber?: string;
  address?: AddressData;
}

export interface SubmittedData extends FormData {
  profileImageUrl?: string;
}

interface MeetingFormProps {
  mode: 'create' | 'edit';
  initialData?: InitialData;
  onSubmit: (data: SubmittedData, address: AddressData) => void;
}

export const MeetingForm = ({
  mode,
  initialData,
  onSubmit,
}: MeetingFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    category: 'CULTURE',
    meetingName: '',
    introduction: '',
    profileImage: null,
    userLimit: 0,
    accountNumber: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    city: '',
    district: '',
    isComplete: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    console.log('🔄 초기 데이터 적용:', initialData);
    setFormData(prev => ({
      category: initialData.category ?? prev.category,
      meetingName: initialData.meetingName ?? prev.meetingName,
      introduction: initialData.introduction ?? prev.introduction,
      profileImage:
        typeof initialData.profileImage === 'string'
          ? null
          : (initialData.profileImage ?? prev.profileImage),
      userLimit: initialData.userLimit ?? prev.userLimit,
      accountNumber: initialData.accountNumber ?? prev.accountNumber,
    }));
    if (initialData.address) {
      setSelectedAddress(initialData.address);
    }
    if (
      initialData.profileImage &&
      typeof initialData.profileImage === 'string'
    ) {
      setImagePreview(initialData.profileImage);
    }
  }, [initialData]);

  // 폼 데이터 변경 헬퍼 (로그 포함)
  const onFormChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    console.log(`✏️ onFormChange: field="${String(field)}"`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 관심사 변경
  const handleCategoryChange = (selected: Category | Category[]) => {
    // single-select 모드이므로 Category 타입만 처리
    if (typeof selected === 'string') {
      console.log('📂 handleCategoryChange:', selected);
      onFormChange('category', selected);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert(
          '지원하지 않는 파일 형식입니다. JPEG 또는 PNG 파일만 업로드 가능합니다.',
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      onFormChange('profileImage', file);

      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    onFormChange('profileImage', null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSpecialCharacters = (value: string) =>
    value.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '');

  const handleMeetingNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const clean = removeSpecialCharacters(e.target.value);
    if (clean.length <= 20) {
      onFormChange('meetingName', clean);
    }
  };

  const handleIntroductionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const clean = removeSpecialCharacters(e.target.value);
    if (clean.length <= 50) {
      onFormChange('introduction', clean);
    }
  };

  // capacity 변경 (로그 포함)
  const handleUserLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('🔢 capacity raw:', e.target.value);
    const parsed = parseInt(e.target.value) || 1;
    console.log('🔢 parsed:', parsed);
    const bounded = Math.min(parsed, 100);
    console.log('🔢 bounded <=100:', bounded);
    onFormChange('userLimit', bounded);
  };

  const handleSubmit = () => {
    onSubmit(formData, selectedAddress);
  };
  const onClickMeetingDelete = () => setIsModalOpen(true);
  const handleMeetingDelete = () => setIsModalOpen(false);
  const handleModalClose = () => setIsModalOpen(false);

  // 폼 유효성
  const isFormValid =
    formData.category.trim().length > 0 &&
    formData.meetingName.trim().length >= 1 &&
    formData.introduction.trim().length >= 1 &&
    formData.profileImage !== null &&
    formData.userLimit >= 1 &&
    selectedAddress.isComplete;

  // 종합 디버그 로그
  useEffect(() => {
    console.groupCollapsed('🛠️ Form Validation 상태');
    console.log(
      'categoryValid →',
      formData.category,
      formData.category.trim().length > 0,
    );
    console.log(
      'meetingNameValid →',
      formData.meetingName,
      formData.meetingName.trim().length >= 1,
    );
    console.log(
      'introductionValid →',
      formData.introduction,
      formData.introduction.trim().length >= 1,
    );
    console.log('capacityValid →', formData.userLimit, formData.userLimit >= 1);
    console.log('addressValid →', selectedAddress.isComplete, selectedAddress);
    console.log('▶︎ isFormValid →', isFormValid);
    console.groupEnd();
  }, [
    formData.category,
    formData.meetingName,
    formData.introduction,
    formData.userLimit,
    selectedAddress.isComplete,
    isFormValid,
  ]);

  return (
    <>
      <div className="flex flex-col bg-gray-50">
        <div className="p-6 bg-white">
          <div className="space-y-6">
            {/* 관심사 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>모임의 관심사
              </label>
              <CategorySection
                mode="single-select"
                // 4) initialValue 도 Category 타입
                initialValue={initialData?.category ?? formData.category}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* 모임 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>모임 이름
              </label>
              <input
                type="text"
                value={formData.meetingName}
                onChange={handleMeetingNameChange}
                placeholder="모임 이름을 입력해주세요"
                className="w-full px-4 py-3 border rounded-lg"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                최소 1자 이상 20자 이하, 특수문자 제외 (
                {formData.meetingName.length}/20)
              </p>
            </div>

            {/* 한줄 소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>모임 한줄 소개
              </label>
              <input
                type="text"
                value={formData.introduction}
                onChange={handleIntroductionChange}
                placeholder="모임을 간단히 소개해주세요"
                className="w-full px-4 py-3 border rounded-lg"
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                최소 1자 이상 50자 이하, 특수문자 제외 (
                {formData.introduction.length}/50)
              </p>
            </div>

            {/* 대표 사진 */}
            <div>
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="text-red-400 mr-1">*</span>모임 대표 사진
              </label>
              <div className="flex items-start space-x-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full h-full object-cover rounded border border-gray-300 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-white text-xs px-1 rounded-bl border border-gray-300"
                      onClick={handleImageRemove}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    이미지 선택하기
                  </button>
                )}

                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG 파일만 업로드 가능
              </p>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>모임 지역
              </label>
              <AddressSelector
                initialCity={selectedAddress.city}
                initialDistrict={selectedAddress.district ?? ''}
                onAddressChange={setSelectedAddress}
              />
            </div>

            {/* 정원 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>정원
              </label>
              <input
                type="number"
                value={formData.userLimit}
                onChange={handleUserLimitChange}
                className="w-full px-4 py-3 border rounded-lg"
                min={1}
                max={100}
                required
              />
            </div>

            {/* 제출 */}
            <div className="pt-4">
              <button
                type="button"
                disabled={!isFormValid}
                onClick={handleSubmit}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 ${
                  isFormValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {mode === 'edit' ? '모임 수정하기' : '모임 만들기'}
              </button>

              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={onClickMeetingDelete}
                  className="w-full mt-4 py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                >
                  모임 삭제하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleMeetingDelete}
        title="정말로 모임을 삭제하시겠습니까?"
      />
    </>
  );
};

export default MeetingForm;
