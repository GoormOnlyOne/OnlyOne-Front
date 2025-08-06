// 채팅 메시지 하나의 DTO
export interface ChatMessageDto {
  messageId: number;
  chatRoomId: number;
  senderId: number;
  senderNickname: string;
  profileImage: string | null;
  text: string | null;
  imageUrl: string | null;
  sentAt: string; // ISO 8601 형식 문자열
  deleted: boolean;
}

// 채팅 메시지 전송 요청 시 사용
export interface SendMessageRequest {
  text?: string | null;
  imageUrl?: string | null;
}

export type ChatRoomType = 'CLUB' | 'SCHEDULE';

// ✅ 채팅방 리스트에서 사용되는 DTO
export interface ChatRoomSummary {
  chatRoomId: number;
  clubId: number;
  scheduleId: number | null;
  type: ChatRoomType;
  chatRoomName: string; // string으로 고정, 서버에서 빈 문자열 혹은 "이름 없음" 기본값 줌
  lastMessageText: string;
  lastMessageTime: string;
}

// 공통 응답 타입
export interface PagedResponse<T> {
  success: boolean;
  data: T;
}
