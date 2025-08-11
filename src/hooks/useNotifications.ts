import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  createNotification as apiCreateNotification,
} from '../api/notification';
import type { 
  Notification,   
  CreateNotificationRequest 
} from '../types/notification';

interface UseNotificationsProps {
  userId: number;
  pageSize?: number;
}

export const useNotifications = ({ userId, pageSize = 20 }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 알림 API 호출 시작:', {
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize
      });

      const response = await getNotifications({
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize,
      });

      console.log('✅ 알림 API 응답:', response);

      const newNotifications = response.notifications;
      
      setNotifications(prev => 
        reset ? newNotifications : [...prev, ...newNotifications]
      );
      setCursor(response.nextCursor);
      setHasMore(response.hasNext);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
      console.error('Failed to load notifications - 상세 에러:', err);
      console.error('API 호출 파라미터:', {
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize
      });
    } finally {
      setLoading(false);
    }
  }, [userId, cursor, pageSize, loading]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiMarkAllAsRead(userId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
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
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [userId]);

  const createNotification = useCallback(async (data: CreateNotificationRequest) => {
    try {
      const response = await apiCreateNotification(data);
      return response;
    } catch (err) {
      console.error('Failed to create notification:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    void loadNotifications(true);
  }, [userId, loadNotifications]); 

  // SSE 이벤트 리스너 추가
  useEffect(() => {
    const handleNotificationReceived = (event: CustomEvent) => {
      console.log('SSE notification received:', event.detail);
      setNotifications(prev => [event.detail, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleUnreadCountUpdated = (event: CustomEvent) => {
      console.log('Unread count updated:', event.detail);
      setUnreadCount(event.detail.count);
    };

    window.addEventListener('notification-received', handleNotificationReceived as EventListener);
    window.addEventListener('unread-count-updated', handleUnreadCountUpdated as EventListener);

    return () => {
      window.removeEventListener('notification-received', handleNotificationReceived as EventListener);
      window.removeEventListener('unread-count-updated', handleUnreadCountUpdated as EventListener);
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
    console.log('SSE connection logic should be implemented in SSE service');
  }, [userId]);

  const disconnect = useCallback(() => {
    console.log('SSE disconnection logic should be implemented in SSE service');
  }, []);

  return {
    connected,
    error,
    lastHeartbeat,
    connect,
    disconnect,
  };
};