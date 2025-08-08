import { useState, useEffect, useCallback } from 'react';
import FCMService from '../services/fcm';

interface UseFCMProps {
  userId: number;
  enabled?: boolean;
}

export const useFCM = ({ userId, enabled = true }: UseFCMProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeFCM = useCallback(async () => {
    if (!enabled || loading) return;

    try {
      setLoading(true);
      setError(null);

      const hasPermission = await FCMService.requestPermission();
      setPermission(Notification.permission);

      if (!hasPermission) {
        setError('알림 권한이 필요합니다.');
        return;
      }

      const fcmToken = await FCMService.getToken();
      if (fcmToken) {
        setToken(fcmToken);
        
        const sent = await FCMService.sendTokenToServer(fcmToken, userId);
        if (!sent) {
          console.warn('Failed to send FCM token to server');
        }
      }
    } catch (err) {
      setError('FCM 초기화에 실패했습니다.');
      console.error('FCM initialization error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, enabled, loading]);

  const setupMessageListener = useCallback((callback: (payload: any) => void) => {
    return FCMService.setupMessageListener(callback);
  }, []);

  useEffect(() => {
    if (enabled && userId) {
      initializeFCM();
    }
  }, [userId, enabled, initializeFCM]);

  return {
    token,
    permission,
    loading,
    error,
    initialize: initializeFCM,
    setupMessageListener,
  };
};