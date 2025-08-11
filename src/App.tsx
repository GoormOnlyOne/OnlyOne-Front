import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';
import sseService from './services/sse';
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
      showToast(message, mappedType as any, durationMs);
    };
    
    setGlobalToastFunction(toastWrapper);
  }, [showToast]);

  // SSE 연결 시작
  useEffect(() => {
    const initializeSSE = async () => {
      try {
        console.log('🚀 SSE 연결 초기화 시작 (/sse/subscribe/{userId} 엔드포인트 사용)');
        
        // 임시로 userId 1로 테스트 (실제로는 인증된 사용자 ID 사용)
        const testUserId = 1;
        
        // SSEService 연결 시작
        await sseService.connect(testUserId);
        console.log('✅ SSE Service 연결 완료');
        
        // NotificationService 연결 시작
        await notificationService.connect(testUserId);
        console.log('✅ Notification Service 연결 완료');
        
      } catch (error) {
        console.error('❌ SSE 초기화 실패:', error);
      }
    };

    initializeSSE();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      sseService.disconnect();
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