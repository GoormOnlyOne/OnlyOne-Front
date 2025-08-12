import { useEffect, useCallback, useState } from 'react';
import {
  notificationService,
  type SSEEvent,
} from '../services/notificationService';
import { getNotifications, markAllAsRead } from '../api/notification';
import type { Notification } from '../types/notification';

export interface UseNotificationOptions {
  userId: number;
  autoConnect?: boolean;
  enableBrowserNotifications?: boolean;
}

export interface UseNotificationReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
}

export function useNotification(
  options: UseNotificationOptions,
): UseNotificationReturn {
  const {
    userId,
    autoConnect = true,
    enableBrowserNotifications = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }, []);

  // 브라우저 알림 표시
  const showBrowserNotification = useCallback(
    (notification: Notification) => {
      if (
        !enableBrowserNotifications ||
        Notification.permission !== 'granted'
      ) {
        return;
      }

      const getNotificationTitle = (type: string): string => {
        switch (type) {
          case 'CHAT':
            return '새 메시지';
          case 'SETTLEMENT':
            return '정산 알림';
          case 'LIKE':
            return '좋아요';
          case 'COMMENT':
            return '새 댓글';
          default:
            return 'BuddKit 알림';
        }
      };

      const browserNotification = new Notification(
        getNotificationTitle(notification.type),
        {
          body: notification.content,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: `notification-${notification.notificationId}`,
          requireInteraction: false,
        },
      );

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    },
    [enableBrowserNotifications],
  );

  // 알림 목록 새로고침 (새 API 응답 구조 적용)
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getNotifications();

      // CommonResponse에서 data 추출 후 사용
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // SSE 연결
  const connect = useCallback(async () => {
    try {
      setError(null);
      await notificationService.connect(userId);
      setIsConnected(true);

      // 초기 알림 목록 로드
      await refreshNotifications();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
    }
  }, [userId, refreshNotifications]);

  // SSE 연결 해제
  const disconnect = useCallback(() => {
    notificationService.disconnect();
    setIsConnected(false);
  }, []);

  // 모든 알림을 읽음으로 표시
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await markAllAsRead(userId);
      setUnreadCount(0);

      // 알림 목록의 isRead 상태 업데이트
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 설정
  useEffect(() => {
    if (enableBrowserNotifications) {
      requestNotificationPermission();
    }

    // 알림 이벤트 리스너
    const handleNotification = (event: SSEEvent) => {
      const notification = event.data as Notification;
      
      // 알림 목록에 추가
      setNotifications(prev => [notification, ...prev]);

      // 읽지 않은 카운트 증가
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }

      // 브라우저 알림 표시
      showBrowserNotification(notification);
    };

    // 읽지 않은 카운트 업데이트 리스너
    const handleUnreadCount = (event: SSEEvent) => {
      const { count } = event.data;
      setUnreadCount(count);
    };

    // 이벤트 리스너 등록
    notificationService.addEventListener('notification', handleNotification);
    notificationService.addEventListener('unread-count', handleUnreadCount);

    // 연결 상태 모니터링
    const checkConnection = () => {
      setIsConnected(notificationService.isConnected());
    };

    const connectionInterval = setInterval(checkConnection, 5000);

    // 자동 연결
    if (autoConnect) {
      connect();
    }

    // 정리 함수
    return () => {
      notificationService.removeEventListener(
        'notification',
        handleNotification,
      );
      notificationService.removeEventListener(
        'unread-count',
        handleUnreadCount,
      );
      clearInterval(connectionInterval);

      if (autoConnect) {
        disconnect();
      }
    };
  }, [
    userId,
    autoConnect,
    enableBrowserNotifications,
    connect,
    disconnect,
    requestNotificationPermission,
    showBrowserNotification,
  ]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    markAllAsRead: handleMarkAllAsRead,
    refreshNotifications,
    requestNotificationPermission,
  };
}

export default useNotification;
