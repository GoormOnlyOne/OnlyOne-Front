import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Router';
import { ToastProvider, useToast } from './components/common/ToastContext';
import { setGlobalToastFunction } from './api/errorToast';
import { useEffect } from 'react';

function AppContent() {
  const { showToast } = useToast();

  useEffect(() => {
    setGlobalToastFunction(showToast);
  }, [showToast]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
