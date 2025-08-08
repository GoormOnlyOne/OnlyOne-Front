export type NotificationType = 'CHAT' | 'SETTLEMENT' | 'LIKE' | 'COMMENT';

export interface Notification {
  notificationId: number;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  cursor: number;
  hasMore: boolean;
  unreadCount: number;
}

export interface CreateNotificationRequest {
  userId: number;
  type: NotificationType;
  args: string[];
}

export interface CreateNotificationResponse {
  notificationId: number;
  content: string;
  fcmSent: boolean;
  createdAt: string;
}

export interface SSENotificationData {
  timeout: number;
}