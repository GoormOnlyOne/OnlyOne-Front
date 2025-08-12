import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  ToastProvider,
  useToast,
} from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';
import fcmService from './services/fcmService';

function AppContent() {
  const { showToast } = useToast();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // ToastType 차이 해결을 위한 래퍼 함수
    const toastWrapper = (
      message: string,
      type?: 'success' | 'error' | 'warning' | 'info' | 'default',
      durationMs?: number,
    ) => {
      // 'default'를 'info'로 매핑하거나 필터링
      const mappedType = type === 'default' ? 'info' : type;
      showToast(
        message,
        mappedType as 'success' | 'error' | 'warning' | 'info',
        durationMs,
      );
    };

    setGlobalToastFunction(toastWrapper);
  }, [showToast]);

  // FCM 초기화 (인증된 사용자만)
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    // 이미 초기화된 경우 재초기화 스킵 (중복 방지)
    if (fcmService.isReady()) {
      return;
    }

    const initializeFCM = async () => {
      try {
        const fcmInitialized = await fcmService.initialize();

        if (fcmInitialized) {
          await fcmService.sendTokenToBackend();
        }
      } catch {
        // FCM 초기화 실패는 조용히 처리
      }
    };

    initializeFCM();
  }, [isAuthenticated, user, isLoading]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
