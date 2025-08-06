import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// 백엔드 응답 타입 정의
interface KakaoLoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    kakaoId: number;
    nickname: string | null;
    profileImage: string | null;
    isNewUser: boolean;
  };
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '20px'
    }}>
      {loading && (
        <div>
          <div style={{ marginBottom: '16px' }}>카카오 로그인 처리 중...</div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: 'red', 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '8px',
          maxWidth: '400px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>로그인 오류</div>
          <div>{error}</div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            잠시 후 로그인 페이지로 이동합니다...
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KakaoCallback;