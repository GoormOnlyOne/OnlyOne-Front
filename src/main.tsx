import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// 개발 환경에서 테스트 인증 설정 로드
if (import.meta.env.DEV) {
  import('./utils/setupTestAuth');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
