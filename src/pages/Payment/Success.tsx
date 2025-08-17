import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  showApiErrorToast,
  showToast as globalToast,
} from '../../components/common/Toast/ToastProvider';
import apiClient, { type ApiError } from '../../api/client';
import Loading from '../../components/common/Loading';

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
  const [isProcessing, setIsProcessing] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentKey = searchParams.get('paymentKey') ?? '';
  const orderId = searchParams.get('orderId') ?? '';
  const amount = Number(searchParams.get('amount') ?? 0);

  // 결제 처리 + 재시도
  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    (async function processPaymentWithRetry() {
      try {
        // 1) 성공 콜백(사전 저장)
        await apiClient.post<SavePaymentRequestDto>('/payments/success', {
          orderId,
          amount,
        });

        // 2) 승인 재시도 루프
        const maxRetries = 6;
        let lastError: ApiError | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const res = await apiClient.post<ConfirmPaymentRequestDto>(
              '/payments/confirm',
              { paymentKey, orderId, amount },
            );
            if (res.success) {
              setIsConfirmed(true);
              setIsProcessing(false);
              return;
            }
          } catch (err) {
            lastError = err as ApiError;
            console.warn(`Confirm attempt ${attempt} failed`, err);
            if (attempt < maxRetries) await delay(5000);
          }
        }

        // 3) 최종 실패 처리: 에러 상태 세팅 + 실패 보고 API 호출
        setErrorOccurred(lastError);
        try {
          await apiClient.post<ConfirmPaymentRequestDto>('/payments/fail', {
            paymentKey,
            orderId,
            amount,
          });
        } catch (failErr) {
          console.error('결제 실패 보고 API 호출 실패:', failErr);
          // 실패 보고가 실패해도 UI 흐름은 계속
        } finally {
          setIsProcessing(false);
        }
      } catch (outerErr) {
        // /payments/success 호출 자체가 실패한 경우도 최종 실패로 처리
        console.error('사전 저장 처리 실패:', outerErr);
        setErrorOccurred(outerErr as ApiError);
        try {
          await apiClient.post<ConfirmPaymentRequestDto>('/payments/fail', {
            paymentKey,
            orderId,
            amount,
          });
        } catch (failErr) {
          console.error('결제 실패 보고 API 호출 실패:', failErr);
        } finally {
          setIsProcessing(false);
        }
      }
    })();
  }, [paymentKey, orderId, amount]);

  // 결제 에러 토스트 + 리다이렉트
  useEffect(() => {
    if (!errorOccurred) return;
    showApiErrorToast(errorOccurred);
    console.error('결제 최종 실패:', errorOccurred);
    const timer = setTimeout(() => navigate('/mypage'), 1000);
    return () => clearTimeout(timer);
  }, [errorOccurred, navigate]);

  // 결제 성공 처리
  useEffect(() => {
    if (!isConfirmed) return;
    globalToast('결제가 성공적으로 완료되었습니다!', 'success', 2000);
    navigate('/mypage');
  }, [isConfirmed, navigate]);

  return (
    <div className="wrapper w-full flex items-center justify-center min-h-screen">
      {isProcessing && !errorOccurred && !isConfirmed && (
        <div className="flex flex-col items-center gap-4">
          <Loading size="lg" text="결제 승인 처리 중..." />
          <p className="description text-gray-600">
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
