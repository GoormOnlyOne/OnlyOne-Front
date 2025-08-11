import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount } from '../../../api/notification';
import { getUserIdFromToken } from '../../../utils/auth';
import logo from '../../../assets/image.png';

export default function Header() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const userId = getUserIdFromToken(token);
        if (!userId) return;
        
        const count = await getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    // 초기 로드
    fetchUnreadCount();

    // 주기적으로 업데이트 (30초마다)
    const interval = setInterval(fetchUnreadCount, 30000);

    // SSE 이벤트 리스너 추가
    const handleUnreadCountUpdated = (event: CustomEvent) => {
      console.log('Unread count updated via SSE:', event.detail);
      if (event.detail && typeof event.detail.count === 'number') {
        setUnreadCount(event.detail.count);
      }
    };

    const handleNotificationReceived = () => {
      // 새 알림이 올 때 카운트 다시 조회
      fetchUnreadCount();
    };

    window.addEventListener('unread-count-updated', handleUnreadCountUpdated as EventListener);
    window.addEventListener('notification-received', handleNotificationReceived);

    return () => {
      clearInterval(interval);
      window.removeEventListener('unread-count-updated', handleUnreadCountUpdated as EventListener);
      window.removeEventListener('notification-received', handleNotificationReceived);
    };
  }, []);

  return (
    <header className="h-full bg-white border-b border-gray-100">
      <div className="h-full flex items-center justify-between px-4">
        <Link
          to="/"
          className="inline-flex items-center h-12"
          aria-label="홈으로"
        >
          <img
            src={logo}
            alt="서비스 로고"
            className="h-10 w-auto block" // 높이만 정하고 가로는 비율 유지
            decoding="async"
            loading="eager"
          />
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/search"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <i className="ri-search-line text-gray-600 text-lg"></i>
          </Link>

          <Link
            to="/notice"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors relative"
          >
            <i className="ri-notification-2-line text-gray-600 text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
