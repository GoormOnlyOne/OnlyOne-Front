import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import MyChatMessage from '../../components/domain/chat/MyChatMessage';
import OtherChatMessage from '../../components/domain/chat/OtherChatMessage';

import { fetchChatMessages } from '../../api/chat';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { ChatMessageDto } from '../../types/chat/chat.types';

const CURRENT_USER_ID = 1; // TODO: 로그인 유저 ID로 교체

const formatChatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const ChatRoom: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const chatRoomIdNum = Number(chatRoomId);

  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { messages: liveMessages, sendMessage } = useChatSocket(chatRoomIdNum, CURRENT_USER_ID);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ 초기 메시지 로드
  useEffect(() => {
    if (!chatRoomIdNum) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchChatMessages(chatRoomIdNum);
        console.log('✅ 전체 응답:', res);

        const receivedMessages = res.data;

        if (Array.isArray(receivedMessages)) {
          setMessages(receivedMessages);
        } else {
          console.warn("📛 서버 응답이 배열이 아님:", receivedMessages);
          setMessages([]);
        }
      } catch (e: any) {
        setError(e?.message ?? '메시지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [chatRoomIdNum]);

  // ✅ 실시간 메시지 수신 시 반영
  useEffect(() => {
    if (liveMessages.length === 0) return;
    const latest = liveMessages[liveMessages.length - 1];
    setMessages(prev => [...prev, latest]);
  }, [liveMessages]);

  // ✅ 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 메시지 전송
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !chatRoomIdNum) return;

    sendMessage(trimmed);
    setText('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="px-4 py-3 bg-white border-b shadow-sm">
        <h2 className="text-lg font-semibold">채팅방 #{chatRoomIdNum || '-'}</h2>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <div className="text-gray-400 text-sm">불러오는 중...</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {!loading && !error && messages.map((m, idx) => {
          const isMine = m.senderId === CURRENT_USER_ID;
          const showProfile = idx === 0 || messages[idx - 1].senderId !== m.senderId;

          return isMine ? (
            <MyChatMessage
              key={m.messageId}
              message={m.text}
              imageUrl={m.imageUrl}
              timestamp={formatChatTime(m.sentAt)}
              isRead={true}
              userId={m.senderId}
            />
          ) : (
            <OtherChatMessage
              key={m.messageId}
              profileImage={m.profileImage ?? undefined}
              username={m.senderNickname}
              message={m.text}
              imageUrl={m.imageUrl}
              timestamp={formatChatTime(m.sentAt)}
              showProfile={showProfile}
              userId={m.senderId}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 border-t bg-white">
        <form className="flex items-center space-x-2" onSubmit={handleSend}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 disabled:opacity-50"
            disabled={!text.trim()}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;