import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

// 백엔드 응답 타입 정의
interface KakaoLoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  newUser: boolean;
  error?: string;
}

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default');
  const [alertConfirm, setAlertConfirm] = useState<(() => void) | undefined>(undefined);

  const openAlert = (
    msg: string,
    options?: { variant?: 'default' | 'danger'; onConfirm?: () => void }
  ) => {
    setAlertMsg(msg);
    setAlertVariant(options?.variant ?? 'default');
    setAlertConfirm(() => options?.onConfirm);
    setIsAlertOpen(true);
  };

  useEffect(() => {
    const handleKakaoCallback = async () => {
      // 이미 요청이 진행 중이면 중단
      if (isProcessing.current) {
        return;
      }
      isProcessing.current = true;
      try {
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          setError('인증 코드가 없습니다.');
          openAlert('인증 코드가 없습니다.', {
            variant: 'danger',
            onConfirm: () => navigate('/login'),
          });
          return;
        }

        console.log('카카오 인증 코드:', code);

        // 백엔드로 인증 코드 전송
        const response = await apiClient.post<KakaoLoginResponse>(
          `/auth/kakao/callback?code=${code}`,
        );

        console.log('백엔드 응답:', response);

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
          if (response.data.newUser) {
            // backend에서 newUser 필드가 true인 경우
            navigate('/signup');
          } else {
            navigate('/');
          }
        } else {
          const msg = response.data.error || '로그인 처리 중 오류가 발생했습니다.';
          setError(msg);
          openAlert(msg, { variant: 'danger', onConfirm: () => navigate('/login') });
        }
      } catch (error: any) {
        console.error('카카오 로그인 실패:', error);

        if (error?.status === 403) {
          const msg = '탈퇴한 계정입니다. 탈퇴한 계정은 다시 로그인할 수 없습니다.';
          setError(msg);
          openAlert(msg, { variant: 'danger', onConfirm: () => navigate('/login') });
          return;
        }

        const msg = error?.message || '카카오 로그인 처리 중 오류가 발생했습니다.';
        setError(msg);
        openAlert(msg, { variant: 'danger', onConfirm: () => navigate('/login') });
      } finally {
        setLoading(false);
      }
    };

    handleKakaoCallback();
  }, [navigate, login]);

  return (
    <div className="flex flex-col justify-center items-center h-screen px-5">
      {loading && <Loading text="카카오 로그인 처리 중..." />}

      {error && (
        <div className="text-red-600 text-center p-5 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <div className="font-bold mb-2">로그인 오류</div>
          <div>{error}</div>
          <div className="mt-2 text-sm text-gray-600">
            잠시 후 로그인 페이지로 이동합니다...
          </div>
        </div>
      )}

      <Alert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => {
          setIsAlertOpen(false);
          alertConfirm?.();
        }}
        title={alertMsg}
        variant={alertVariant}
        cancelText="닫기"
        confirmText="확인"
      />
    </div>
  );
};

export default KakaoCallback;
