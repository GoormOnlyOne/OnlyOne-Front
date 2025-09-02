export type NotificationType = 'settlement' | 'comment' | 'like' | 'chat'; // 리피드 추가해야 됨.

interface NotificationBase {
  id: number;
  type: NotificationType;
  groupImageUrl: string; 

  // 그룹명이 여기 있어야 되나? 싶기도
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

  // 게시글 좋아요, 댓글 좋아요 구분 필요해 보임
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
