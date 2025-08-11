import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';
import { notificationService } from './services/notificationService';

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
      showToast(message, mappedType as 'success' | 'error' | 'warning' | 'info', durationMs);
    };
    
    setGlobalToastFunction(toastWrapper);
  }, [showToast]);

  // SSE 연결 시작
  useEffect(() => {
    const initializeSSE = async () => {
      try {
        console.log('🚀 SSE 연결 초기화 시작 (/sse/subscribe/{userId} 엔드포인트 사용)');
        
        // 환경변수나 AuthContext에서 userId 가져오기 (임시로 1 사용)
        const testUserId = parseInt(import.meta.env.VITE_TEST_USER_ID || '1');
        
        // SSE 연결은 NotificationService에서만 생성 (중복 방지)
        await notificationService.connect(testUserId);
        console.log('✅ Notification Service 연결 완료');
        
      } catch (error) {
        console.error('❌ SSE 초기화 실패:', error);
      }
    };

    initializeSSE();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      notificationService.disconnect();
      console.log('🔌 SSE 서비스 정리 완료');
    };
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