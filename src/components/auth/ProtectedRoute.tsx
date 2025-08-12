import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActive?: boolean; // ACTIVE 상태만 허용할지 여부
}

const ProtectedRoute = ({
  children,
  requireActive = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationLock = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    // 이미 네비게이션이 진행 중이면 방지
    if (navigationLock.current) return;

    // 인증되지 않은 경우 로그인 페이지로 (현재 페이지가 로그인이 아닐 때만)
    if (!isAuthenticated && location.pathname !== '/login') {
      navigationLock.current = true;
      navigate('/login', { replace: true });
      setTimeout(() => { navigationLock.current = false; }, 1000);
      return;
    }

    // GUEST 상태에서 ACTIVE가 필요한 경우 회원가입으로 (현재 페이지가 회원가입이 아닐 때만)
    if (requireActive && isGuest && location.pathname !== '/signup') {
      navigationLock.current = true;
      navigate('/signup', { replace: true });
      setTimeout(() => { navigationLock.current = false; }, 1000);
      return;
    }
  }, [isAuthenticated, user, isLoading, isGuest, navigate, requireActive, location.pathname]);

  // 로딩 중이면 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩중...</div>
      </div>
    );
  }

  // 인증되지 않았거나 권한이 없으면 null 반환 (리다이렉션 처리됨)
  if (!isAuthenticated || (requireActive && isGuest)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
