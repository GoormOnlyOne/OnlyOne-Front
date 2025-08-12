import { useState, useEffect } from 'react';
import sseService from '../../services/sse';
import { notificationService } from '../../services/notificationService';

export const SSEStatus = () => {
  const [sseState, setSSEState] = useState<'CONNECTING' | 'OPEN' | 'CLOSED'>(
    'CLOSED',
  );
  const [notificationServiceState, setNotificationServiceState] =
    useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // SSE 상태 모니터링
    const interval = setInterval(() => {
      const newSSEState = sseService.getConnectionState();
      const newNotificationState = notificationService.isConnected();

      setSSEState(newSSEState);
      setNotificationServiceState(newNotificationState);

      if (newSSEState === 'OPEN' || newNotificationState) {
        setLastActivity(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (sseState === 'OPEN' || notificationServiceState) return 'bg-green-500';
    if (sseState === 'CONNECTING') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (sseState === 'OPEN' || notificationServiceState) return 'SSE 연결됨';
    if (sseState === 'CONNECTING') return 'SSE 연결 중...';
    return 'SSE 연결 끊김';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className="bg-white border rounded-lg shadow-lg p-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {showDetails && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-600">
            <div>SSE Service: {sseState}</div>
            <div>
              Notification Service:{' '}
              {notificationServiceState ? 'Connected' : 'Disconnected'}
            </div>
            {lastActivity && (
              <div>마지막 활동: {lastActivity.toLocaleTimeString()}</div>
            )}
            <div className="mt-1 text-xs text-gray-400">클릭하여 숨기기</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSEStatus;
