import { useEffect, useCallback, useState } from 'react';
import { sseService, type NotificationSSEData } from '../services/sseService';
import { useToast } from '../components/common/Toast/ToastContext';

interface UseSSENotificationsOptions {
  userId: number;
  onNotification?: (notification: NotificationSSEData) => void;
  enabled?: boolean;
}

export function useSSENotifications({
  userId,
  onNotification,
  enabled = true,
}: UseSSENotificationsOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificationSSEData | null>(null);
  const { showToast } = useToast();

  const handleMessage = useCallback((data: NotificationSSEData) => {
    console.log('New notification received:', data);
    setLastNotification(data);
    
    // Show toast notification
    showToast(data.content, 'info', 5000);
    
    // Call custom handler if provided
    onNotification?.(data);
  }, [onNotification, showToast]);

  const handleError = useCallback((error: Event) => {
    console.error('SSE error:', error);
    setIsConnected(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsConnected(true);
    showToast('실시간 알림 연결됨', 'success', 2000);
  }, [showToast]);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // Connect to SSE
    sseService.connect(userId, handleMessage, handleError, handleOpen);

    // Cleanup on unmount
    return () => {
      sseService.disconnect();
      setIsConnected(false);
    };
  }, [userId, enabled, handleMessage, handleError, handleOpen]);

  const reconnect = useCallback(() => {
    if (userId) {
      sseService.disconnect();
      sseService.connect(userId, handleMessage, handleError, handleOpen);
    }
  }, [userId, handleMessage, handleError, handleOpen]);

  const disconnect = useCallback(() => {
    sseService.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastNotification,
    reconnect,
    disconnect,
  };
}