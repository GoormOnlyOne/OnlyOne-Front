import { useState, useEffect, type ChangeEvent } from 'react';
import Modal from '../../common/Modal';

export interface ScheduleFormData {
  meetingName: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  costPerPerson: number;
  capacity: number;
}

export interface InitialData {
  meetingName?: string;
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  costPerPerson?: number;
  capacity?: number;
}

interface ScheduleFormProps {
  mode: 'create' | 'edit';
  initialData?: InitialData;
  onSubmit: (data: ScheduleFormData) => void;
  onDelete?: () => void;
}

export const ScheduleForm = ({ mode, initialData, onSubmit, onDelete }: ScheduleFormProps) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    meetingName: '',
    meetingDate: '',
    meetingTime: '',
    location: '',
    costPerPerson: 0,
    capacity: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const onFormChange = <K extends keyof ScheduleFormData>(field: K, value: ScheduleFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanValue = removeSpecialCharacters(e.target.value);
    if (cleanValue.length <= 20) {
      onFormChange('location', cleanValue);
    }
  };

  const handleCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
    onFormChange('costPerPerson', Math.min(value, 1000000));
  };

  const handleCapacityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 1;
    onFormChange('capacity', Math.max(1, Math.min(value, 100)));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    onFormChange('meetingDate', selectedDate);
    
    // 날짜가 변경되었을 때, 선택된 날짜가 오늘이고 
    // 기존 선택된 시간이 현재 시간보다 이전이면 시간을 초기화
    if (selectedDate === getTodayDate() && formData.meetingTime) {
      const currentTime = getCurrentTime();
      if (formData.meetingTime < currentTime) {
        onFormChange('meetingTime', '');
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const onClickMeetingDelete = () => {
    setIsModalOpen(true);
  };

  const handleMeetingDelete = () => {
    setIsModalOpen(false);
    onDelete?.();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const isFormValid =
    formData.meetingName.trim().length >= 1 &&
    formData.meetingDate !== '' &&
    formData.meetingTime !== '' &&
    formData.location.trim().length >= 1 &&
    formData.costPerPerson >= 0 &&
    formData.capacity >= 1 &&
    formData.capacity <= 100;

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getMinTime = () => {
    // 선택된 날짜가 오늘인 경우에만 현재 시간 이후로 제한
    const today = getTodayDate();
    if (formData.meetingDate === today) {
      return getCurrentTime();
    }
    return '00:00';
  };

  return (
    <>
      <div className="flex flex-col bg-gray-50">
        <div className="p-6 bg-white">
          <div className="space-y-6">
            {/* 정모 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>정모 이름
              </label>
              <input
                type="text"
                value={formData.meetingName}
                onChange={handleMeetingNameChange}
                placeholder="정모 이름을 작성해주세요."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                최소 1자 이상 20자 이하 ({formData.meetingName.length}/20)
              </p>
            </div>

            {/* 정모 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>정모 날짜
              </label>
              <input
                type="date"
                value={formData.meetingDate}
                onChange={handleDateChange}
                min={getTodayDate()}
                placeholder="정모 날짜를 선택해주세요."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 정모 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>정모 시간
              </label>
              <input
                type="time"
                value={formData.meetingTime}
                onChange={(e) => onFormChange('meetingTime', e.target.value)}
                min={getMinTime()}
                placeholder="정모 시간을 선택해주세요."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.meetingDate === getTodayDate() && (
                <p className="text-xs text-gray-500 mt-1">
                  현재 시간 이후로만 선택 가능합니다.
                </p>
              )}
            </div>

            {/* 모임 위치 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>모임 위치
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="위치를 입력하세요."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                최소 1자 이상 20자 이하 ({formData.location.length}/20)
              </p>
            </div>

            {/* 인당 비용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>인당 비용
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.costPerPerson ? formatNumber(formData.costPerPerson) : 0}
                  onChange={handleCostChange}
                  placeholder="정모 예상 비용을 입력해주세요."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  원
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                최소 0원 ~ 최대 1,000,000원
              </p>
            </div>

            {/* 정원 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-1">*</span>정원
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={handleCapacityChange}
                  placeholder="정모 인원을 설정해주세요."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  명
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                최소 1명 ~ 최대 100명
              </p>
            </div>

            {/* 제출 버튼 */}
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
                {mode === 'edit' ? '정모 수정하기' : '정모 만들기'}
              </button>

              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={onClickMeetingDelete}
                  className="w-full mt-4 py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer"
                >
                  정모 삭제하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleMeetingDelete}
        title="정모를 삭제하시겠습니까?"
      />
    </>
  );
};

export default ScheduleForm;