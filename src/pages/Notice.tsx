import { useEffect, useState } from 'react';
import { getNotifications } from '../api/notification';
import type { Notification as NotificationApi } from '../types/notification';

export const Notice = () => {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // 임시로 userId=1로 설정 (실제로는 로그인한 사용자 ID 사용)
        const response = await getNotifications({ userId: 1 });
        setNotifications(response.notifications);
      } catch (err) {
        setError('알림을 불러오는데 실패했습니다.');
        console.error('알림 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleClick = (notification: NotificationApi) => {
    console.log('알림 클릭:', notification);
    // 알림 타입에 따른 라우팅 처리
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">알림을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">알림이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.notificationId}
          onClick={() => handleClick(notification)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              notification.type === 'CHAT' ? 'bg-blue-100 text-blue-800' :
              notification.type === 'SETTLEMENT' ? 'bg-green-100 text-green-800' :
              notification.type === 'LIKE' ? 'bg-red-100 text-red-800' :
              notification.type === 'COMMENT' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {notification.type}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString('ko-KR')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{notification.content}</p>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};
