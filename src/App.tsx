import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';
import fcmService from './services/fcmService';

function AppContent() {
  const { showToast } = useToast();

  useEffect(() => {
    // ToastType 차이 해결을 위한 래퍼 함수
    const toastWrapper = (
      message: string,
      type?: 'success' | 'error' | 'warning' | 'info' | 'default',
      durationMs?: number
    ) => {
      // 'default'를 'info'로 매핑하거나 필터링
      const mappedType = type === 'default' ? 'info' : type;
      showToast(message, mappedType as any, durationMs);
    };
    
    setGlobalToastFunction(toastWrapper);
  }, [showToast]);

  // FCM 초기화
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        console.log('📱 FCM 초기화 시작...');
        const fcmInitialized = await fcmService.initialize();
        
        if (fcmInitialized) {
          // 환경변수에서 userId 가져오기 (임시로 1 사용)
          const testUserId = parseInt(import.meta.env.VITE_TEST_USER_ID || '1');
          await fcmService.sendTokenToBackend(testUserId);
          console.log('✅ FCM 초기화 및 토큰 전송 완료');
        } else {
          console.log('⚠️ FCM 초기화 실패 (알림 권한 거부 또는 브라우저 미지원)');
        }
      } catch (error) {
        console.error('❌ FCM 초기화 실패:', error);
      }
    };

    initializeFCM();
  }, []);

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