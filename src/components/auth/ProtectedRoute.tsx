import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (isLoading) return; // 로딩 중이면 대기

    // 인증되지 않은 경우 로그인 페이지로
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // ACTIVE 상태가 필요한데 GUEST 상태인 경우 회원가입 페이지로
    if (requireActive && isGuest) {
      navigate('/signup');
      return;
    }
  }, [isAuthenticated, user, isLoading, isGuest, navigate, requireActive]);

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
