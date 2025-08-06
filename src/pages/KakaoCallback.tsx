import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// 백엔드 응답 타입 정의
interface KakaoLoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  error?: string;
}

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          setError('인증 코드가 없습니다.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log('카카오 인증 코드:', code);

        // 백엔드로 인증 코드 전송
        const response = await apiClient.post<KakaoLoginResponse>(`/auth/kakao/callback?code=${code}`);

        console.log('백엔드 응답:', response.data);

        // 로그인 성공 처리
        if (response.success && response.data.accessToken) {
          const { accessToken, refreshToken } = response.data;
          
          // 토큰들을 localStorage에 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          // AuthContext를 통해 로그인 상태 업데이트
          login(accessToken);

          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);

          // 신규 사용자인 경우 회원가입 페이지로, 아니면 홈으로
          if (response.data.isNewUser) { // backend에서 isNewUser 필드가 true인 경우
            navigate('/signup');
          } else {
            navigate('/');
          }
        } else {
          setError(response.data.error || '로그인 처리 중 오류가 발생했습니다.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error: any) {
        console.error('카카오 로그인 실패:', error);
        setError(error.message || '카카오 로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleKakaoCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen px-5">
      {loading && (
        <div className="text-center">
          <div className="mb-4">카카오 로그인 처리 중...</div>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center p-5 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <div className="font-bold mb-2">로그인 오류</div>
          <div>{error}</div>
          <div className="mt-2 text-sm text-gray-600">
            잠시 후 로그인 페이지로 이동합니다...
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoCallback;