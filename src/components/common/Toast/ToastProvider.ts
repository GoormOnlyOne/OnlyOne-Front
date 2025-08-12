export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

let globalShowToast:
  | ((message: string, type: ToastType, duration?: number) => void)
  | null = null;

export function setGlobalToastFunction(
  showToast: (message: string, type?: ToastType, durationMs?: number) => void,
) {
  globalShowToast = showToast;
}

/* API 에러 응답 토스트 */
export function showApiErrorToast(error: unknown) {
  let msg = '알 수 없는 오류가 발생했습니다.';
  
  // API 에러 메시지 추출
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    if (err.response?.data?.message) {
      msg = err.response.data.message;
    } else if (err.data?.message) {
      msg = err.data.message;
    } else if (err.message) {
      msg = err.message;
    }
  } else if (error instanceof Error) {
    msg = error.message;
  }
  
  if (globalShowToast) {
    globalShowToast(msg, 'error', 3000);
  } else {
    // Toast가 준비되지 않은 경우 콘솔 로그로 대체
    console.error('Toast not ready, error message:', msg);
  }
}

/* 기본 토스트 */
export function showToast(
  message: string,
  type: ToastType = 'default',
  durationMs: number = 3000,
) {
  if (globalShowToast) {
    globalShowToast(message, type, durationMs);
  } else {
    // Toast가 준비되지 않은 경우 콘솔 로그로 대체
    console.warn('Toast not ready, message:', message, 'type:', type);
  }
}
