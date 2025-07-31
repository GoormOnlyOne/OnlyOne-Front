import { useNavigate } from 'react-router-dom';

interface TitleHeaderProps {
  isBack?: boolean;
  isTitle?: boolean;
  titleText?: string;
  isLike?: boolean;
  isOut?: boolean;
  onBack?: () => void;
}

export default function TitleHeader({ 
  isBack = false,
  isTitle = false,
  titleText = '타이틀',
  isLike = false,
  isOut = false,
  onBack
}: TitleHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // 기본 동작: 이전 페이지로 이동
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 relative">
      <div className="h-full flex items-center justify-between px-2">
        {/* 좌측: 뒤로가기 */}
        <div className="flex items-center gap-2">
          {isBack && (
            <button 
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="뒤로가기"
            >
              <i className="ri-arrow-left-line text-gray-700 text-xl"></i>
            </button>
          )}
        </div>

        {/* 중앙: 타이틀 (정중앙 고정) */}
        {isTitle && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-base font-semibold text-gray-800">{titleText}</p>
          </div>
        )}

        {/* 우측: 아이콘 버튼들 */}
        <div className="flex items-center gap-2">
          {isLike && (
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="좋아요"
            >
              <i className="ri-heart-line text-gray-600 text-lg"></i>
            </button>
          )}
          {isOut && (
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="나가기"
            >
              <i className="ri-logout-box-line text-gray-600 text-lg"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}