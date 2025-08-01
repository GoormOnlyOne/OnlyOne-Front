import { useEffect, useState, type ChangeEvent } from 'react';
import CategorySection from '../../../components/domain/category/CategorySection';
import AddressSelector, { type AddressData } from '../../../components/common/AddressSelector';

interface FormData {
  meetingName: string;
  introduction: string;
  profileImage: File | null;
  capacity: number;
  accountNumber: string;
}

interface MeetingFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<FormData> & { address?: AddressData };
  onSubmit: (data: FormData, address: AddressData) => void;
}

export const MeetingForm = ({ mode, initialData, onSubmit }: MeetingFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    meetingName: '',
    introduction: '',
    profileImage: null,
    capacity: 1,
    accountNumber: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    city: '',
    district: '',
    isComplete: false,
  });

  // 초기값 세팅
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));

      if (initialData.address) {
        setSelectedAddress(initialData.address);
      }

      if (initialData.profileImage && typeof initialData.profileImage === 'string') {
        setImagePreview(initialData.profileImage);
      }
    }
  }, [initialData]);

  const onFormChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFormChange('profileImage', file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onFormChange('accountNumber', value);
  };

  const removeSpecialCharacters = (value: string) => {
    return value.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '');
  };

  const handleMeetingNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanValue = removeSpecialCharacters(e.target.value);
    if (cleanValue.length <= 20) {
      onFormChange('meetingName', cleanValue);
    }
  };

  const handleIntroductionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanValue = removeSpecialCharacters(e.target.value);
    if (cleanValue.length <= 50) {
      onFormChange('introduction', cleanValue);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData, selectedAddress);
  };

  const isFormValid =
    formData.meetingName.trim().length >= 1 &&
    formData.introduction.trim().length >= 1 &&
    formData.profileImage !== null &&
    formData.capacity >= 1 &&
    selectedAddress.isComplete;

  return (
    <div className="flex flex-col bg-gray-50">
      <div className="max-w-2xl mx-auto p-6 bg-white">
        <div className="space-y-6">
          {/* 관심사 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-400 mr-1">*</span>모임의 관심사
            </label>
            <CategorySection mode="single-select" />
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
              최소 1자 이상 20자 이하, 특수문자 제외 ({formData.meetingName.length}/20)
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
              최소 1자 이상 50자 이하, 특수문자 제외 ({formData.introduction.length}/50)
            </p>
          </div>

          {/* 대표 사진 */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-400 mr-1">*</span>
              모임 대표 사진
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG 파일만 업로드 가능</p>
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg border border-gray-300 overflow-hidden">
                  <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-400 mr-1">*</span>모임 지역
            </label>
            <AddressSelector
              initialCity={selectedAddress.city}
              initialDistrict={selectedAddress.district}
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
              value={formData.capacity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                onFormChange('capacity', Math.min(value, 100));
              }}
              className="w-full px-4 py-3 border rounded-lg"
              min={1}
              max={100}
              required
            />
          </div>

          {/* 계좌번호 (선택) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모임 계좌번호 (선택)
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={handleAccountNumberChange}
              maxLength={14}
              placeholder="숫자만 입력"
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          {/* 제출 */}
          <div className="pt-4">
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 
              ${isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {mode === 'edit' ? '모임 수정하기' : '모임 만들기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;
