import ProfileImageUpload from '../../common/ProfileImage';
import type { AddressData } from '../../common/AddressSelector';

interface Step3Props {
  formData: {
    nickname: string;
    gender: string;
    birth: string;
    categories?: string[];
    profileImage?: string;
    address?: AddressData;
  };
  onFormChange: (field: string, value: string) => void;
  onProfileImageChange?: (imageUrl: string) => void;
}

const Step3 = ({
  formData,
  onFormChange,
  onProfileImageChange,
}: Step3Props) => {
  const getNicknameError = (nickname: string) => {
    if (!nickname || nickname.trim().length === 0) {
      return '';
    }
    if (nickname.trim().length < 2) {
      return '닉네임은 최소 2자 이상 입력해주세요.';
    }
    if (nickname.length > 10) {
      return '닉네임은 최대 10자까지 입력 가능합니다.';
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname.trim())) {
      return '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.';
    }
    return '';
  };

  const nicknameError = getNicknameError(formData.nickname);
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">정보 입력</h2>
      <p className="text-gray-600 text-center mb-8">
        벗킷에서 사용할 정보를 입력해주세요
      </p>

      <div className="space-y-6">
        {/* 프로필 */}
        <ProfileImageUpload
          defaultImage={formData.profileImage}
          onImageSelect={image => onProfileImageChange?.(image.url)}
          onImageRemove={() => onProfileImageChange?.('')}
        />

        {/* 닉네임 입력 */}
        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="text-red-400 mr-1">*</span>
            <span>닉네임</span>
          </label>
          <input
            type="text"
            id="nickname"
            value={formData.nickname}
            onChange={e => onFormChange('nickname', e.target.value)}
            placeholder="닉네임을 입력해주세요"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
              nicknameError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            maxLength={10}
          />
          {nicknameError ? (
            <p className="text-xs text-red-500 mt-1">{nicknameError}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              최소 2자 이상 10자 이하, 특수문자 제외
            </p>
          )}
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
                value="MALE"
                checked={formData.gender === 'MALE'}
                onChange={e => onFormChange('gender', e.target.value)}
                className="sr-only"
              />
              <div
                className={`
                w-full py-3 px-4 border rounded-lg text-center cursor-pointer transition-all
                ${
                  formData.gender === 'MALE'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
              `}
              >
                남성
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === 'FEMALE'}
                onChange={e => onFormChange('gender', e.target.value)}
                className="sr-only"
              />
              <div
                className={`
                w-full py-3 px-4 border rounded-lg text-center cursor-pointer transition-all
                ${
                  formData.gender === 'FEMALE'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
              `}
              >
                여성
              </div>
            </label>
          </div>
        </div>

        {/* 생년월일 입력 */}
        <div>
          <label
            htmlFor="birth"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="text-red-400 mr-1">*</span>
            <span>생년월일</span>
          </label>
          <input
            type="date"
            id="birth"
            value={formData.birth}
            onChange={e => onFormChange('birth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">생년월일을 선택해주세요</p>
        </div>
      </div>
    </div>
  );
};

export default Step3;
