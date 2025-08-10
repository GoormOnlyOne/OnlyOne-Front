import { useNotifications, useSSENotifications } from './useNotifications';
import useNotification from './useNotification';

interface UseIntegratedNotificationsProps {
  userId: number;
  enableFCM?: boolean;
  enableSSE?: boolean;
  pageSize?: number;
}

export const useIntegratedNotifications = ({
  userId,
  enableFCM = true,
  enableSSE = true,
  pageSize = 20,
}: UseIntegratedNotificationsProps) => {
  // 새로운 통합 서비스를 우선 사용 (FCM + SSE 통합)
  const useIntegratedService = enableSSE && enableFCM;

  // 새로운 통합 알림 서비스 (FCM + SSE)
  const integratedNotification = useIntegratedService ? useNotification({
    userId,
    autoConnect: enableSSE,
    enableBrowserNotifications: enableFCM
  }) : null;

  // 기존 hooks (호환성 유지 - 새로운 서비스를 사용하지 않을 때만)
  const legacyNotifications = !useIntegratedService ? useNotifications({ 
    userId, 
    pageSize, 
    enableFCM 
  }) : null;
  
  const legacySSE = (!useIntegratedService && enableSSE) ? useSSENotifications(userId) : {
    connected: false,
    error: null,
    lastHeartbeat: null,
    connect: () => {},
    disconnect: () => {}
  };

  // 새로운 통합 서비스 사용
  if (useIntegratedService && integratedNotification) {
    return {
      notifications: integratedNotification.notifications || [],
      loading: integratedNotification.loading,
      error: integratedNotification.error,
      unreadCount: integratedNotification.unreadCount,
      markAllAsRead: integratedNotification.markAllAsRead,
      refreshNotifications: integratedNotification.refreshNotifications,
      isRealTimeConnected: integratedNotification.isConnected,
      sse: {
        connected: integratedNotification.isConnected,
        error: integratedNotification.error,
        lastHeartbeat: null,
        connect: integratedNotification.connect,
        disconnect: integratedNotification.disconnect,
      }
    };
  }

  // 기존 방식 (호환성 유지)
  if (legacyNotifications) {
    return {
      ...legacyNotifications,
      sse: {
        connected: legacySSE.connected,
        error: legacySSE.error,
        lastHeartbeat: legacySSE.lastHeartbeat,
        connect: legacySSE.connect,
        disconnect: legacySSE.disconnect,
      },
      isRealTimeConnected: legacySSE.connected,
    };
  }

  // 폴백 (빈 상태)
  return {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
    markAllAsRead: async () => {},
    refreshNotifications: async () => {},
    isRealTimeConnected: false,
    sse: {
      connected: false,
      error: null,
      lastHeartbeat: null,
      connect: () => {},
      disconnect: () => {},
    }
  };
};