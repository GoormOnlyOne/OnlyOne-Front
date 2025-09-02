import type { 
  Notification,
  NotificationListResponse,
  CreateNotificationRequest,
  CreateNotificationResponse 
} from '../../types/notification';

// 테스트용 mock 데이터 생성 함수들
export const createMockNotification = (
  overrides?: Partial<Notification>
): Notification => ({
  notificationId: 1,
  content: '테스트 알림 내용',
  type: 'CHAT',
  isRead: false,
  createdAt: '2025-01-19T10:00:00Z',
  ...overrides,
});

export const createMockNotificationList = (
  count: number = 3,
  overrides?: Partial<Notification>
): Notification[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockNotification({
      notificationId: index + 1,
      content: `테스트 알림 ${index + 1}`,
      ...overrides,
    })
  );
};

export const createMockNotificationListResponse = (
  overrides?: Partial<NotificationListResponse>
): NotificationListResponse => ({
  notifications: createMockNotificationList(),
  unreadCount: 2,
  hasNext: false,
  nextCursor: null,
  ...overrides,
});

export const createMockCreateNotificationRequest = (
  overrides?: Partial<CreateNotificationRequest>
): CreateNotificationRequest => ({
  userId: 1,
  type: 'CHAT',
  content: ['새로운 메시지가 도착했습니다'],
  ...overrides,
});

export const createMockCreateNotificationResponse = (
  overrides?: Partial<CreateNotificationResponse>
): CreateNotificationResponse => ({
  notificationId: 1,
  userId: 1,
  content: '새로운 메시지가 도착했습니다',
  type: 'CHAT',
  isRead: false,
  createdAt: '2025-01-19T10:00:00Z',
  ...overrides,
});