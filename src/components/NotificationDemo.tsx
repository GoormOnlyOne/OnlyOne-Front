import React, { useState } from 'react';
import useNotification from '../hooks/useNotification';

interface NotificationDemoProps {
  userId: number;
}

const NotificationDemo: React.FC<NotificationDemoProps> = ({ userId }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    markAllAsRead,
    refreshNotifications,
    requestNotificationPermission,
  } = useNotification({
    userId,
    autoConnect: true,
    enableBrowserNotifications: true,
  });

  const handleToggleConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'CHAT':
        return 'bg-blue-100 text-blue-800';
      case 'SETTLEMENT':
        return 'bg-green-100 text-green-800';
      case 'LIKE':
        return 'bg-red-100 text-red-800';
      case 'COMMENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">알림 서비스</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <button
          onClick={handleToggleConnection}
          className={`w-full py-2 px-4 rounded font-medium ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? '로딩 중...' : isConnected ? 'SSE 연결 해제' : 'SSE 연결'}
        </button>

        <button
          onClick={requestNotificationPermission}
          className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
        >
          브라우저 알림 권한 요청
        </button>

        <button
          onClick={refreshNotifications}
          className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
          disabled={loading}
        >
          알림 새로고침
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="flex items-center space-x-2 text-lg font-semibold"
        >
          <span>알림 목록</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            모두 읽음
          </button>
        )}
      </div>

      {showNotifications && (
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">알림이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getNotificationTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.content}</p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
        <p><strong>사용자 ID:</strong> {userId}</p>
        <p><strong>연결 상태:</strong> {isConnected ? '연결됨' : '연결 안됨'}</p>
        <p><strong>읽지 않은 알림:</strong> {unreadCount}개</p>
        <p><strong>전체 알림:</strong> {notifications.length}개</p>
      </div>
    </div>
  );
};

export default NotificationDemo;