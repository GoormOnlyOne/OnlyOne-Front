import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';
import sseService from './services/sse';
import { notificationService } from './services/notificationService';
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

  // SSE 및 FCM 연결 시작
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🚀 알림 서비스 초기화 시작');
        
        // 임시로 userId 1로 테스트 (실제로는 인증된 사용자 ID 사용)
        const testUserId = 1;
        
        // FCM 초기화
        console.log('📱 FCM 초기화 시작...');
        const fcmInitialized = await fcmService.initialize();
        
        if (fcmInitialized) {
          // FCM 토큰을 백엔드로 전송
          await fcmService.sendTokenToBackend(testUserId);
          console.log('✅ FCM 초기화 및 토큰 전송 완료');
        } else {
          console.log('⚠️ FCM 초기화 실패 (알림 권한 거부 또는 브라우저 미지원)');
        }
        
        // SSE 연결 시작
        console.log('🌐 SSE 연결 초기화 시작...');
        await sseService.connect(testUserId);
        console.log('✅ SSE Service 연결 완료');
        
        // NotificationService 연결 시작
        await notificationService.connect(testUserId);
        console.log('✅ Notification Service 연결 완료');
        
        console.log('🎉 모든 알림 서비스 초기화 완료');
        
      } catch (error) {
        console.error('❌ 알림 서비스 초기화 실패:', error);
      }
    };

    initializeNotifications();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      sseService.disconnect();
      notificationService.disconnect();
      console.log('🔌 알림 서비스 정리 완료');
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