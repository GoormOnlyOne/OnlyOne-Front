import apiClient from './client';
import type {
  NotificationListResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
} from '../types/notification';

// 호환성을 위한 타입 별칭
export type NotificationResponse = NotificationListResponse;

// 알림 목록 조회 (첫 페이지 조회 시 자동으로 모든 알림 읽음 처리)
export const getNotifications = async (): Promise<NotificationListResponse> => {
  const response =
    await apiClient.get<NotificationListResponse>(`/notifications`);
  return response.data; // ApiResponse에서 data 추출
};

// 알림 생성
export const createNotification = async (
  data: CreateNotificationRequest,
): Promise<CreateNotificationResponse> => {
  const response = await apiClient.post<CreateNotificationResponse>(
    '/notifications',
    data,
  );

  return response.data; // ApiResponse에서 data 추출
};

// 모든 알림 읽음 처리 (백엔드에서 자동으로 처리되므로 더 이상 필요 없음)
// 첫 페이지 조회 시 자동으로 모든 알림이 읽음 처리됨
export const markAllAsRead = async (): Promise<{ success: boolean; data: null }> => {
  // 백엔드에서 getNotifications 첫 페이지 호출 시 자동 처리
  // 호환성을 위해 함수는 유지하되 실제로는 getNotifications를 호출
  await getNotifications();
  return { success: true, data: null };
};

// 알림 삭제
export const deleteNotification = async (params: {
  notificationId: number;
  userId: number;
}): Promise<null> => {
  const searchParams = new URLSearchParams({
    userId: params.userId.toString(),
  });

  const response = await apiClient.delete<null>(
    `/notifications/${params.notificationId}?${searchParams.toString()}`,
  );
  return response.data;
};

// 읽지 않은 알림 개수 조회
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<number>(`/notifications/unread-count`);
  return response.data;
};

// SSE 연결은 sseService를 통해 관리
// @deprecated Use sseService directly instead
export { sseService } from '../services/sseService';
