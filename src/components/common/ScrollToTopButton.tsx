import { useState, useEffect } from 'react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // main 요소 찾기 (스크롤 컨테이너)
      const mainElement = document.querySelector('main');
      if (mainElement) {
        // 300px 이상 스크롤했을 때 버튼 표시
        if (mainElement.scrollTop > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', toggleVisibility);
      return () => mainElement.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* 툴팁 */}
      <div 
        className={`
          absolute bottom-full right-0 mb-2 
          bg-gray-800 text-white text-xs 
          px-3 py-1.5 rounded-md
          whitespace-nowrap
          transition-all duration-200
          ${showTooltip && isVisible
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1 pointer-events-none'
          }
        `}
      >
        맨 위로 가기
        {/* 툴팁 화살표 */}
        <div className="absolute top-full right-4 w-0 h-0 
          border-l-4 border-r-4 border-t-4
          border-l-transparent border-r-transparent border-t-gray-800"
        />
      </div>

      {/* 버튼 */}
      <button
        onClick={scrollToTop}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          w-12 h-12 
          bg-gradient-to-br from-blue-500 to-purple-500
          text-white 
          rounded-full 
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300 transform
          hover:scale-110
          cursor-pointer
          ${isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none'
          }
        `}
        aria-label="맨 위로 가기"
      >
        <i className="ri-arrow-up-line text-xl"></i>
      </button>
    </div>
  );
}