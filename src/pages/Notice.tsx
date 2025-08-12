import { useEffect, useState } from 'react';
import { getNotifications, deleteNotification } from '../api/notification';
import type { Notification as NotificationApi } from '../types/notification';
import Loading from '../components/common/Loading';

export const Notice = () => {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // 임시로 userId=1로 설정 (실제로는 로그인한 사용자 ID 사용)
        const response = await getNotifications({ userId: 1 });

        // 첫 페이지 조회 시 모든 알림을 읽음 처리로 UI 업데이트
        const readNotifications = response.notifications.map(notification => ({
          ...notification,
          isRead: true, // 백엔드에서 자동으로 읽음 처리되므로 UI에서도 반영
        }));

        setNotifications(readNotifications);
        setUnreadCount(0); // 모든 알림이 읽음 처리되었으므로 0으로 설정
        
      } catch {
        setError('알림을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleClick = (notification: NotificationApi) => {
    // 알림 타입에 따른 라우팅 처리
  };

  const handleDelete = async (
    notification: NotificationApi,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지

    try {
      await deleteNotification({
        notificationId: notification.notificationId,
        userId: 1, // 임시로 userId=1 사용
      });

      // 삭제할 알림이 읽지 않은 상태였다면 unreadCount 감소
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // 알림 목록에서 제거
      setNotifications(prev =>
        prev.filter(n => n.notificationId !== notification.notificationId),
      );
    } catch {
      setError('알림 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="relative min-h-[160px]" aria-busy={loading}>
      {' '}
      {/* ★ 변경 */}
      {loading && <Loading overlay text="알림을 불러오는 중..." />}{' '}
      {/* ★ 변경 */}
      {/* 에러 배너 */}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {/* 읽지 않은 알림 배너 (로딩/에러 아닐 때만) */}
      {unreadCount > 0 && !loading && !error && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            읽지 않은 알림이 {unreadCount}개 있습니다.
          </p>
        </div>
      )}
      {/* 빈 상태 */}
      {notifications.length === 0 && !loading && !error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">알림이 없습니다.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.notificationId}
              onClick={() => handleClick(notification)}
              className={`p-4 mb-0 border-b border-gray-200 cursor-pointer hover:bg-neutral-100 ${
                notification.isRead ? 'bg-neutral-50 border-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.type === 'CHAT'
                      ? 'bg-blue-100 text-blue-800'
                      : notification.type === 'SETTLEMENT'
                        ? 'bg-green-100 text-green-800'
                        : notification.type === 'LIKE'
                          ? 'bg-red-100 text-red-800'
                          : notification.type === 'COMMENT'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {notification.type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString('ko-KR')}
                  </span>
                  <button
                    onClick={e => handleDelete(notification, e)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{notification.content}</p>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-neutral-50 rounded-full mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
