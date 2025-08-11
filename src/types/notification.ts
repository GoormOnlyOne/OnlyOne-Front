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
  unreadCount: number;
  hasNext: boolean;
  nextCursor: number | null;
}

export interface CreateNotificationRequest {
  userId: number;
  type: NotificationType;
  content: string[];
}

export interface CreateNotificationResponse {
  notificationId: number;
  userId: number;
  content: string;
  type: NotificationType;
  isRead: boolean;
  fcmSent: boolean;
  createdAt: string;
}

export interface SSENotificationData {
  timeout: number;
}