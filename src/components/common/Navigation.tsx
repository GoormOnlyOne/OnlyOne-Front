import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const pathname = location.pathname;

  const tabs = [
    {
      id: 'home',
      label: '홈',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill',
      href: '/',
    },
    {
      id: 'category',
      label: '카테고리',
      icon: 'ri-apps-line',
      activeIcon: 'ri-apps-fill',
      href: '/category',
    },
    {
      id: 'meeting',
      label: '모임',
      icon: 'ri-group-line',
      activeIcon: 'ri-group-fill',
      href: '/meeting',
    },
    {
      id: 'mypage',
      label: '마이페이지',
      icon: 'ri-user-line',
      activeIcon: 'ri-user-fill',
      href: '/mypage',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={`
                relative flex flex-col items-center justify-center space-y-1 
                transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {/* 활성 탭 배경 애니메이션 */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-50 opacity-50 scale-90 rounded-lg transition-all duration-300" />
              )}

              {/* 아이콘 */}
              <i
                className={`
                ${isActive ? tab.activeIcon : tab.icon} 
                text-xl w-6 h-6 flex items-center justify-center
                transition-all duration-300
                ${isActive ? 'scale-110 animate-bounce-once' : 'scale-100'}
              `}
              ></i>

              {/* 라벨 */}
              <span
                className={`
                text-xs font-medium transition-all duration-300
                ${isActive ? 'font-semibold' : 'font-normal'}
              `}
              >
                {tab.label}
              </span>

              {/* 하단 인디케이터 */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full animate-slide-in" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
