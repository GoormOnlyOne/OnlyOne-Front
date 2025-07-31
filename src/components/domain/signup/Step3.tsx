import ProfileImageUpload from '../../common/ProfileImage';

interface Step3Props {
  formData: {
    nickname: string;
    gender: string;
    birth: string;
  };
  onFormChange: (field: string, value: string) => void;
  onProfileImageChange?: (imageUrl: string) => void;
}

const Step3 = ({ formData, onFormChange }: Step3Props) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">정보 입력</h2>
      <p className="text-gray-600 text-center mb-8">
        벗킷에서 사용할 정보를 입력해주세요
      </p>
      
      <div className="space-y-6">
        {/* 프로필 */}
        <ProfileImageUpload />
        {/* TODO: ProfileImageUpload 컴포넌트의 실제 props 확인 필요 */}
        {/* 예: onChange, onUpload, onSelect 등의 prop 이름 확인 */}
        
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
            onChange={(e) => onFormChange('nickname', e.target.value)}
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
                onChange={(e) => onFormChange('gender', e.target.value)}
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
                onChange={(e) => onFormChange('gender', e.target.value)}
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
            onChange={(e) => onFormChange('birth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            생년월일을 선택해주세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3;