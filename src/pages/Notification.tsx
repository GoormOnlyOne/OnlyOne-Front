import React from 'react';
import { useIntegratedNotifications } from '../hooks/useIntegratedNotifications';

interface Notification {
  notificationId: number;
  content: string;
  type: 'CHAT' | 'SETTLEMENT' | 'LIKE' | 'COMMENT';
  isRead: boolean;
  createdAt: string;
}

export const Notification = () => {
  const {
    notifications,
    loading,
    error,
    isRealTimeConnected
  } = useIntegratedNotifications({
    userId: 1,
    enableFCM: true,
    enableSSE: true,
    pageSize: 50
  });

  const handleNotificationClick = (notification: Notification) => {
    console.log('알림 클릭:', notification);
    // 실제 라우팅 로직은 여기서 구현
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'CHAT': return '채팅';
      case 'SETTLEMENT': return '정산';
      case 'LIKE': return '좋아요';
      case 'COMMENT': return '댓글';
      default: return '알림';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'CHAT': return 'bg-blue-100 text-blue-800';
      case 'SETTLEMENT': return 'bg-green-100 text-green-800';
      case 'LIKE': return 'bg-red-100 text-red-800';
      case 'COMMENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <div>알림을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error && (!notifications || notifications.length === 0)) {
    return (
      <div className="px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">알림을 불러올 수 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">네트워크 연결을 확인하고 다시 시도해 주세요.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showErrorWarning = error && notifications && notifications.length > 0;

  return (
    <div className="px-4">
      {/* 에러 경고 메시지 */}
      {showErrorWarning && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ 일부 알림 기능에 문제가 있을 수 있습니다.
          </p>
        </div>
      )}
      
      {/* 연결 상태 표시 */}
      {!isRealTimeConnected && !showErrorWarning && (
        <div className="mb-2 text-sm text-orange-600">
          실시간 알림 연결이 끊어졌습니다.
        </div>
      )}
      
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          알림이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: Notification) => (
            <div
              key={notification.notificationId}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              } hover:bg-gray-100`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getNotificationTypeColor(
                    notification.type
                  )}`}
                >
                  {getNotificationTypeText(notification.type)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{notification.content}</p>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};