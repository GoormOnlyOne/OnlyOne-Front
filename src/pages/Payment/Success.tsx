import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';
import apiClient, { type ApiError } from '../../api/client';

interface ConfirmPaymentRequestDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface SavePaymentRequestDto {
  orderId: string;
  amount: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function Success() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState<ApiError | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount') ?? 0);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    async function processPaymentWithRetry() {
      await apiClient.post<SavePaymentRequestDto>('/payments/success', {
        orderId,
        amount,
      });

      const maxRetries = 6;
      let lastError: ApiError | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await apiClient.post<ConfirmPaymentRequestDto>(
            '/payments/confirm',
            {
              paymentKey,
              orderId,
              amount,
            },
          );
          if (res.success) {
            setIsConfirmed(true);
            return;
          }
        } catch (err) {
          lastError = err as ApiError;
          console.warn(`Confirm attempt ${attempt} failed`, err);
          if (attempt < maxRetries) await delay(5000);
        }
      }
      setErrorOccurred(lastError);
    }

    processPaymentWithRetry();
  }, [paymentKey, orderId, amount]);

  // 결제 에러 처리
  useEffect(() => {
    if (!errorOccurred) return;
    showApiErrorToast(errorOccurred);
    console.error('결제 최종 실패:', errorOccurred);
    setTimeout(() => navigate('/mypage'), 1000);
  }, [errorOccurred, navigate]);

  // 결제 성공 처리
  useEffect(() => {
    if (!isConfirmed) return;
    globalToast('결제가 성공적으로 완료되었습니다!', 'success', 2000);
    navigate('/mypage');
  }, [isConfirmed, navigate]);

  return (
    <div className="wrapper w-full flex items-center justify-center min-h-screen">
      {!isConfirmed && !errorOccurred && (
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://static.toss.im/lotties/loading-spot-apng.png"
            width={120}
            height={120}
            alt="loading"
          />
          <h2 className="title">결제 요청까지 성공했어요.</h2>
          <p className="description">
            결제 승인 처리 중입니다. 잠시만 기다려주세요.
          </p>
        </div>
      )}

      {errorOccurred && (
        <div className="flex flex-col items-center gap-6">
          <h2 className="title text-red-500">결제 승인에 실패했습니다.</h2>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
