import React, { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser, getCurrentUser } from '../api/auth';
import Loading from '../components/common/Loading';

// 사용자 타입 정의
export interface User {
  userId: number;
  kakaoId: number;
  nickname: string;
  status: 'GUEST' | 'ACTIVE' | 'INACTIVE';
  profileImage: string;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isGuest: boolean;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 초기화: localStorage에서 토큰과 사용자 정보 로드
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedAccessToken && isMounted) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setIsAuthenticated(true);

          // 사용자 정보 조회
          try {
            const userResponse = await getCurrentUser();
            if (userResponse.success && isMounted) {
              setUser(userResponse.data);
            }
          } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            // 토큰이 유효하지 않으면 로그아웃 처리 (컴포넌트가 마운트된 상태에서만)
            if (isMounted) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setIsAuthenticated(false);
              setAccessToken(null);
              setRefreshToken(null);
            }
          }
        }
      } catch (error) {
        console.error('인증 정보 로드 실패:', error);
        // 잘못된 데이터가 있으면 제거
        if (isMounted) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // 짧은 지연으로 초기화 안정성 증대
    const timeoutId = setTimeout(initializeAuth, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // 로그인 함수
  const login = async (newAccessToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);

    setAccessToken(newAccessToken);
    setIsAuthenticated(true);

    // 사용자 정보 조회
    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error('로그인 후 사용자 정보 조회 실패:', error);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    console.log('로그아웃 실행 중...');

    try {
      // 서버에 로그아웃 요청
      if (accessToken) {
        await logoutUser();
        console.log('서버 로그아웃 완료');
      }
    } catch (error) {
      console.error('서버 로그아웃 실패:', error);
      // 서버 로그아웃 실패해도 클라이언트 로그아웃은 진행
    }

    // 클라이언트 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('토큰 제거 완료');

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // 사용자 정보 갱신 함수
  const refreshUser = async () => {
    if (!isAuthenticated || !accessToken) return;

    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    login,
    logout,
    refreshUser,
    isLoading,
    isGuest: user?.status === 'GUEST',
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loading text="로그인 상태 확인 중..." />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
