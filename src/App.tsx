import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  ToastProvider,
  useToast,
} from './components/common/Toast/ToastContext';
import { setGlobalToastFunction } from './components/common/Toast/ToastProvider';
import { router } from './routes/Router';

function AppContent() {
  const { showToast } = useToast();

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
