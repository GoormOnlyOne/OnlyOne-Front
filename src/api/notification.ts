import apiClient from './client';
import type { 
  NotificationListResponse,
  CreateNotificationRequest,
  CreateNotificationResponse
} from '../types/notification';

// 호환성을 위한 타입 별칭
export type NotificationResponse = NotificationListResponse;

// 알림 목록 조회 (첫 페이지 조회 시 자동으로 모든 알림 읽음 처리)
export const getNotifications = async (params: {
  userId: number;
  cursor?: number;
  size?: number;
}): Promise<NotificationListResponse> => {
  const searchParams = new URLSearchParams({
    userId: params.userId.toString(),
  });
  
  if (params.cursor) {
    searchParams.append('cursor', params.cursor.toString());
  }
  if (params.size) {
    searchParams.append('size', params.size.toString());
  }

  const response = await apiClient.get<NotificationListResponse>(
    `/notifications?${searchParams.toString()}`
  );
  
  return response.data; // ApiResponse에서 data 추출
};

// 알림 생성
export const createNotification = async (data: CreateNotificationRequest): Promise<CreateNotificationResponse> => {
  const response = await apiClient.post<CreateNotificationResponse>(
    '/notifications', 
    data
  );
  
  return response.data; // ApiResponse에서 data 추출
};

// 모든 알림 읽음 처리 (백엔드에서 자동으로 처리되므로 더 이상 필요 없음)
// 첫 페이지 조회 시 자동으로 모든 알림이 읽음 처리됨
export const markAllAsRead = async (userId: number): Promise<{ success: boolean; data: null }> => {
  // 백엔드에서 getNotifications 첫 페이지 호출 시 자동 처리
  // 호환성을 위해 함수는 유지하되 실제로는 getNotifications를 호출
  await getNotifications({ userId, cursor: undefined, size: 1 });
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
    `/notifications/${params.notificationId}?${searchParams.toString()}`
  );
  return response.data;
};

// 읽지 않은 알림 개수 조회
export const getUnreadCount = async (userId: number): Promise<number> => {
  const response = await apiClient.get<number>(
    `/notifications/unread-count?userId=${userId}`
  );
  return response.data;
};

// SSE 연결 생성
export const createSSEConnection = (userId: number, lastEventId?: string): EventSource => {
  // 환경변수에서 API 베이스 URL 가져오기 (다른 API와 동일)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/';
  const url = new URL(`sse/subscribe/${userId}`, baseUrl);
  
  // JWT 토큰이 있으면 쿼리 파라미터로 추가 (EventSource는 헤더 설정 불가)
  const token = localStorage.getItem('accessToken');
  if (token) {
    url.searchParams.set('token', token);
  }
  
  console.log('🌐 SSE EventSource 생성:', {
    url: url.toString(),
    userId,
    lastEventId,
    baseUrl,
    timestamp: new Date().toISOString()
  });
  
  // EventSource에 Last-Event-ID 헤더를 설정하려면 직접 설정할 수 없으므로
  // 브라우저가 자동으로 처리하도록 합니다
  const eventSource = new EventSource(url.toString());
  
  // Last-Event-ID가 있는 경우 로그로만 표시
  if (lastEventId) {
    console.log('📋 Last-Event-ID 설정됨:', lastEventId);
  }
  
  return eventSource;
};