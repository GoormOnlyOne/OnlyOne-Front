import type { ApiError } from '../../../api/client';

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
export function showApiErrorToast(error: ApiError) {
  const msg = error.data?.message ?? '알 수 없는 오류가 발생했습니다.';

  if (globalShowToast) {
    globalShowToast(msg, 'error', 3000);
  } else {
    // fallback으로 기본 alert 사용
    alert(msg);
  }
}

/* 기본 토스트 */
export function showToast(
  message: string,
  type: ToastType = 'info',
  durationMs: number = 3000,
) {
  if (globalShowToast) {
    globalShowToast(message, type, durationMs);
  } else {
    alert(message);
  }
}
