// src/api/chat.ts

// src/api/chat.ts

import apiClient from '../api/client';
import type {
  ChatMessageDto,
  SendMessageRequest,
  PagedResponse,
  ChatRoomSummary,
} from '../types/chat/chat.types';

/**
 * 🔁 [선택] 채팅 메시지 목록 가져오기 (초기 로딩용으로 유지할 수 있음)
 */
export const fetchChatMessages = (chatRoomId: number) =>
  apiClient.get<PagedResponse<ChatMessageDto[]>>(
    `/chat/${chatRoomId}/messages`
  );

/**
 * ❌ 사용 안 함: WebSocket 방식으로 대체됨.
 * @deprecated 채팅 메시지 전송은 WebSocket으로 처리하세요
 */
export const sendChatMessage = (
  chatRoomId: number,
  message: SendMessageRequest
) =>
  apiClient.post<PagedResponse<ChatMessageDto>>(
    `/chat/${chatRoomId}/messages`,
    message
  );

/**
 * 📦 채팅방 목록 가져오기
 */
export const fetchChatRoomList = (clubId: number) =>
  apiClient.get<PagedResponse<ChatRoomSummary[]>>(
    `/clubs/${clubId}/chat`
  );