import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  createNotification as apiCreateNotification,
} from '../api/notification';
import type {
  Notification,
  CreateNotificationRequest,
} from '../types/notification';

interface UseNotificationsProps {
  userId: number;
  pageSize?: number;
}

export const useNotifications = ({
  userId,
  pageSize = 20,
}: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (reset = false) => {
      if (loading) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getNotifications();

        const newNotifications = response.notifications;
        
        setNotifications(prev => 
          reset ? newNotifications : [...prev, ...newNotifications]
        );
        setCursor(response.nextCursor);
        setHasMore(response.hasNext);
        setUnreadCount(response.unreadCount);
      } catch {
        setError('알림을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [userId, cursor, pageSize, loading],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiMarkAllAsRead(userId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch {
      // 모든 알림 읽음 처리 실패 무시
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await apiDeleteNotification({
        notificationId,
        userId,
      });
      
      // 삭제 성공시 UI에서 제거
      setNotifications(prev => 
        prev.filter(notification => notification.notificationId !== notificationId)
      );
    } catch {
      // 알림 삭제 실패 무시
    }
  }, [userId]);

  const createNotification = useCallback(async (data: CreateNotificationRequest) => {
    try {
      const response = await apiCreateNotification(data);
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    void loadNotifications(true);
  }, [userId, loadNotifications]);

  // SSE 이벤트 리스너 추가
  useEffect(() => {
    const handleNotificationReceived = (event: CustomEvent) => {
      setNotifications(prev => [event.detail, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleUnreadCountUpdated = (event: CustomEvent) => {
      setUnreadCount(event.detail.count);
    };

    window.addEventListener(
      'notification-received',
      handleNotificationReceived as EventListener,
    );
    window.addEventListener(
      'unread-count-updated',
      handleUnreadCountUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        'notification-received',
        handleNotificationReceived as EventListener,
      );
      window.removeEventListener(
        'unread-count-updated',
        handleUnreadCountUpdated as EventListener,
      );
    };
  }, []);

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    error,
    loadMore: () => loadNotifications(false),
    refresh: () => loadNotifications(true),
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
};

export const useSSENotifications = (userId: number) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  const connect = useCallback(() => {
    // SSE 연결 로직은 별도 서비스에서 처리
  }, [userId]);

  const disconnect = useCallback(() => {
    // SSE 연결 해제 로직은 별도 서비스에서 처리
  }, []);

  return {
    connected,
    error,
    lastHeartbeat,
    connect,
    disconnect,
  };
};
