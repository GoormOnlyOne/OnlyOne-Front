// src/api/chat.ts

import apiClient from '../api/client';
import type {
  PagedResponse,
  ChatRoomSummary,
  ChatRoomMessageResponse,
} from '../types/chat/chat.types';

/**
 * 특정 채팅방의 메시지 목록 조회
 */
export const fetchChatMessages = (
  chatRoomId: number,
  params?: { size?: number; cursorId?: number | null; cursorAt?: string | null }
) =>
  apiClient.get< PagedResponse<ChatRoomMessageResponse> >(
    `/chat/${chatRoomId}/messages`,
    { params }
  );

/**
 * 클럽 내 채팅방 목록 조회
 */
export const fetchChatRoomList = (clubId: number) =>
  apiClient.get<PagedResponse<ChatRoomSummary[]>>(`/clubs/${clubId}/chat`);

/**
 * 메시지 삭제
 */
export const deleteChatMessage = (messageId: number) =>
  apiClient.delete(`/chat/messages/${messageId}`);
