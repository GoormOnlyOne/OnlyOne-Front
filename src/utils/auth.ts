// 인증 관련 유틸리티 함수들

/**
 * 토큰이 만료되었는지 확인
 * @param token JWT 토큰
 * @returns 만료 여부
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return true; // 파싱 오류가 있으면 만료된 것으로 처리
  }
};

/**
 * 토큰에서 사용자 ID 추출
 * @param token JWT 토큰
 * @returns 사용자 ID 또는 null
 */
export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ? parseInt(payload.sub) : null;
  } catch (error) {
    console.error('토큰에서 사용자 ID 추출 오류:', error);
    return null;
  }
};

/**
 * 토큰의 만료 시간 반환
 * @param token JWT 토큰
 * @returns 만료 시간 (Date 객체) 또는 null
 */
export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    console.error('토큰 만료 시간 추출 오류:', error);
    return null;
  }
};

/**
 * localStorage에서 인증 정보 완전 제거
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken'); // 향후 refresh token 구현 시 사용
};

/**
 * 보호된 경로인지 확인
 * @param pathname 경로
 * @returns 보호된 경로 여부
 */
export const isProtectedRoute = (pathname: string): boolean => {
  const publicRoutes = ['/login', '/signup', '/auth/kakao/callback', '/'];
  return !publicRoutes.some(route => pathname.startsWith(route));
};

/**
 * 로그인이 필요한 작업 수행 전 인증 상태 확인
 * @param isAuthenticated 인증 상태
 * @param navigate 라우터 navigate 함수
 * @returns 인증된 경우 true, 아닌 경우 로그인 페이지로 리다이렉트하고 false
 */
export const requireAuth = (
  isAuthenticated: boolean,
  navigate: (path: string) => void,
): boolean => {
  if (!isAuthenticated) {
    navigate('/login');
    return false;
  }
  return true;
};
