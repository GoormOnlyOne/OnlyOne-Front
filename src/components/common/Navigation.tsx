import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const pathname = location.pathname;
  
  const tabs = [
    { id: 'home', label: '홈', icon: 'ri-home-line', activeIcon: 'ri-home-fill', href: '/' },
    { id: 'meetings', label: '모임', icon: 'ri-group-line', activeIcon: 'ri-group-fill', href: '/meetings' },
    { id: 'profile', label: '마이페이지', icon: 'ri-user-line', activeIcon: 'ri-user-fill', href: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={`${isActive ? tab.activeIcon : tab.icon} text-xl w-6 h-6 flex items-center justify-center`}></i>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}