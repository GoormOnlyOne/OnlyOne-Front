import { http, HttpResponse } from 'msw';
import type { 
  NotificationListResponse, 
  CreateNotificationRequest,
  CreateNotificationResponse,
  Notification
} from '../../types/notification';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Mock 데이터
const mockNotifications: Notification[] = [
  {
    notificationId: 1,
    content: '새로운 채팅 메시지가 도착했습니다.',
    type: 'CHAT',
    isRead: false,
    createdAt: '2025-01-19T10:00:00Z',
  },
  {
    notificationId: 2,
    content: '정산이 완료되었습니다.',
    type: 'SETTLEMENT',
    isRead: true,
    createdAt: '2025-01-19T09:00:00Z',
  },
  {
    notificationId: 3,
    content: '게시글에 좋아요가 추가되었습니다.',
    type: 'LIKE',
    isRead: false,
    createdAt: '2025-01-19T08:00:00Z',
  },
];

export const handlers = [
  // 알림 목록 조회
  http.get(`${API_BASE_URL}/notifications`, () => {
    const response: NotificationListResponse = {
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
      hasNext: false,
      nextCursor: null,
    };
    
    return HttpResponse.json({
      success: true,
      data: response,
      message: null
    });
  }),

  // 알림 생성
  http.post(`${API_BASE_URL}/notifications`, async ({ request }) => {
    const body = await request.json() as CreateNotificationRequest;
    
    const newNotification: CreateNotificationResponse = {
      notificationId: Date.now(),
      userId: body.userId,
      content: body.content.join(' '),
      type: body.type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    return HttpResponse.json({
      success: true,
      data: newNotification,
      message: null
    });
  }),

  // 알림 삭제
  http.delete(`${API_BASE_URL}/notifications/:notificationId`, ({ params }) => {
    const { notificationId } = params;
    
    // 실제로는 DB에서 삭제하지만, 여기서는 성공 응답만 반환
    return HttpResponse.json({
      success: true,
      data: null,
      message: `Notification ${notificationId} deleted successfully`
    });
  }),

  // 읽지 않은 알림 개수 조회
  http.get(`${API_BASE_URL}/notifications/unread-count`, () => {
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    
    return HttpResponse.json({
      success: true,
      data: unreadCount,
      message: null
    });
  }),

  // SSE 연결 (간단한 mock)
  http.get(`${API_BASE_URL}/sse/subscribe/:userId`, ({ params }) => {
    const { userId } = params;
    
    // SSE는 특별한 응답 형식이 필요하므로 간단한 텍스트 응답으로 대체
    return new HttpResponse('Connected to SSE', {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }),
];