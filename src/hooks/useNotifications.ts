import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getNotifications, 
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  createNotification as apiCreateNotification,
  createSSEConnection
} from '../api/notification';
import { useFCM } from './useFCM';
import type { 
  Notification,   
  CreateNotificationRequest 
} from '../types/notification';

interface UseNotificationsProps {
  userId: number;
  pageSize?: number;
  enableFCM?: boolean;
}

export const useNotifications = ({ userId, pageSize = 20, enableFCM = true }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fcm = useFCM({ userId, enabled: enableFCM });

  const loadNotifications = useCallback(async (reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 알림 API 호출 시작:', {
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize,
        markAsRead: reset
      });

      const response = await getNotifications({
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize,
        markAsRead: reset, // 첫 페이지 로드시에만 자동 읽음 처리
      });

      console.log('✅ 알림 API 응답:', response);

      if (response.success) {
        const newNotifications = response.data.notifications;
        
        setNotifications(prev => 
          reset ? newNotifications : [...prev, ...newNotifications]
        );
        setCursor(response.data.cursor);
        setHasMore(response.data.hasMore);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
      console.error('Failed to load notifications - 상세 에러:', err);
      console.error('API 호출 파라미터:', {
        userId,
        cursor: reset ? undefined : cursor || undefined,
        size: pageSize,
        markAsRead: reset
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
      const response = await apiDeleteNotification({
        notificationId,
        userId,
      });
      
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notification => notification.notificationId !== notificationId)
        );
      }
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
    loadNotifications(true);
  }, [userId]); 

  useEffect(() => {
    if (enableFCM && fcm) {
      const unsubscribe = fcm.setupMessageListener((payload) => {
        console.log('FCM message received in foreground:', payload);
        
        if (payload.notification) {
          loadNotifications(true);
        }
      });
      
      return unsubscribe;
    }
  }, [enableFCM, fcm, loadNotifications]);

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
    fcm,
  };
};

export const useSSENotifications = (userId: number) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // 저장된 Last-Event-ID 가져오기 (재연결시 사용)
      const lastEventId = localStorage.getItem(`sse-last-event-id-${userId}`);
      const newEventSource = createSSEConnection(userId, lastEventId || undefined);
      
      newEventSource.onopen = () => {
        setConnected(true);
        setError(null);
        console.log('SSE connection opened');
      };

      // 일반 알림 이벤트
      newEventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received notification:', data);
          
          // Last-Event-ID 저장
          if (event.lastEventId) {
            localStorage.setItem(`sse-last-event-id-${userId}`, event.lastEventId);
          }
          
          window.dispatchEvent(new CustomEvent('notification-received', { 
            detail: data 
          }));
        } catch (err) {
          console.error('Failed to parse notification event:', err);
        }
      });

      // 놓친 알림 이벤트 (재연결시)
      newEventSource.addEventListener('missed_notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received missed notification:', data);
          
          // Last-Event-ID 저장
          if (event.lastEventId) {
            localStorage.setItem(`sse-last-event-id-${userId}`, event.lastEventId);
          }
          
          window.dispatchEvent(new CustomEvent('notification-received', { 
            detail: data 
          }));
        } catch (err) {
          console.error('Failed to parse missed_notification event:', err);
        }
      });

      // 읽지 않은 개수 업데이트
      newEventSource.addEventListener('unread_count', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received unread count update:', data);
          
          // Last-Event-ID 저장
          if (event.lastEventId) {
            localStorage.setItem(`sse-last-event-id-${userId}`, event.lastEventId);
          }
          
          window.dispatchEvent(new CustomEvent('unread-count-updated', { 
            detail: data 
          }));
        } catch (err) {
          console.error('Failed to parse unread_count event:', err);
        }
      });

      newEventSource.addEventListener('heartbeat', (event) => {
        try {
          // heartbeat은 단순 텍스트일 수도 있고 JSON일 수도 있음
          let data = event.data;
          try {
            data = JSON.parse(event.data);
          } catch {
            // JSON이 아닌 경우 그냥 텍스트로 사용
          }
          
          // Last-Event-ID 저장
          if (event.lastEventId) {
            localStorage.setItem(`sse-last-event-id-${userId}`, event.lastEventId);
          }
          
          setLastHeartbeat(new Date());
          console.log('Received heartbeat:', data);
        } catch (err) {
          console.error('Failed to parse heartbeat event:', err);
        }
      });

      newEventSource.onerror = (error) => {
        setConnected(false);
        setError('SSE 연결에 오류가 발생했습니다.');
        console.error('SSE error:', error);
        
        setTimeout(() => {
          if (newEventSource.readyState === EventSource.CLOSED) {
            connect();
          }
        }, 3000);
      };

      eventSourceRef.current = newEventSource;
    } catch (err) {
      setError('SSE 연결을 시작할 수 없습니다.');
      console.error('Failed to create SSE connection:', err);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    connected,
    error,
    lastHeartbeat,
    connect,
    disconnect,
  };
};