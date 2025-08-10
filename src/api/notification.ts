import apiClient from './client';
import type { 
  NotificationListResponse,
  CreateNotificationRequest,
  CreateNotificationResponse
} from '../types/notification';

// 호환성을 위한 타입 별칭
export interface NotificationResponse extends NotificationListResponse {}

// FCM 토큰 등록/업데이트
export const updateFcmToken = async (userId: number, fcmToken: string) => {
  const params = new URLSearchParams({ fcmToken });
  const response = await apiClient.put<{ success: boolean; data: null }>(
    `/users/${userId}/fcm-token?${params.toString()}`
  );
  return response.data;
};

// FCM 토큰 삭제
export const deleteFcmToken = async (userId: number) => {
  const response = await apiClient.delete<{ success: boolean; data: null }>(
    `/users/${userId}/fcm-token`
  );
  return response.data;
};

// 알림 목록 조회 (첫 페이지 조회 시 자동으로 모든 알림 읽음 처리)
export const getNotifications = async (params: {
  userId: number;
  cursor?: number;
  size?: number;
}) => {
  const searchParams = new URLSearchParams({
    userId: params.userId.toString(),
  });
  
  if (params.cursor) {
    searchParams.append('cursor', params.cursor.toString());
  }
  if (params.size) {
    searchParams.append('size', params.size.toString());
  }

  const response = await apiClient.get<{
    success: boolean;
    data: NotificationListResponse;
  }>(`/notifications?${searchParams.toString()}`);
  
  return response.data; // CommonResponse에서 data 추출
};

// 알림 생성
export const createNotification = async (data: CreateNotificationRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: CreateNotificationResponse;
  }>('/notifications', data);
  
  return response.data; // CommonResponse에서 data 추출
};

// 모든 알림 읽음 처리 (백엔드에서 자동으로 처리되므로 더 이상 필요 없음)
// 첫 페이지 조회 시 자동으로 모든 알림이 읽음 처리됨
export const markAllAsRead = async (userId: number) => {
  // 백엔드에서 getNotifications 첫 페이지 호출 시 자동 처리
  // 호환성을 위해 함수는 유지하되 실제로는 getNotifications를 호출
  const response = await getNotifications({ userId, cursor: undefined, size: 1 });
  return { success: true, data: null };
};

// 알림 삭제
export const deleteNotification = async (params: {
  notificationId: number;
  userId: number;
}) => {
  const searchParams = new URLSearchParams({
    userId: params.userId.toString(),
  });

  const response = await apiClient.delete<{ success: boolean; data: null }>(
    `/notifications/${params.notificationId}?${searchParams.toString()}`
  );
  return response.data;
};

// SSE 연결 생성 (리팩토링된 경로: /sse/subscribe/{userId})
export const createSSEConnection = (userId: number, lastEventId?: string): EventSource => {
  let sseUrl = `${import.meta.env.VITE_API_BASE_URL}/sse/subscribe/${userId}`;
  
  // Last-Event-ID를 URL 파라미터로 전달 (EventSource는 헤더 설정 제한이 있음)
  if (lastEventId) {
    const params = new URLSearchParams({ lastEventId });
    sseUrl += `?${params.toString()}`;
  }
  
  return new EventSource(sseUrl, {
    withCredentials: false
  });
};