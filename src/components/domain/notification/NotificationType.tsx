export type NotificationType = 'settlement' | 'comment' | 'like' | 'chat';

interface NotificationBase {
  id: number;
  type: NotificationType;
  groupImageUrl: string;
}

export interface SettlementNotification extends NotificationBase {
  type: 'settlement';
  groupName: string;
  meetingName: string;
  amount: string;
}

export interface CommentNotification extends NotificationBase {
  type: 'comment';
  actorName: string;
  postTitle: string;
  commentText: string;
}

export interface LikeNotification extends NotificationBase {
  type: 'like';
  actorName: string;
  postTitle: string;
}

export interface ChatNotification extends NotificationBase {
  type: 'chat';
  actorName: string;
  chatRoomName: string;
  messageText: string;
}

export type Notification =
  | SettlementNotification
  | CommentNotification
  | LikeNotification
  | ChatNotification;
