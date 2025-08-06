import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import MyChatMessage from '../../components/domain/chat/MyChatMessage';
import OtherChatMessage from '../../components/domain/chat/OtherChatMessage';

import { fetchChatMessages } from '../../api/chat';
import { uploadImage } from '../../api/upload';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { ChatMessageDto } from '../../types/chat/chat.types';

const CURRENT_USER_ID = 1;

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { messages: liveMessages, sendMessage } = useChatSocket(chatRoomIdNum, CURRENT_USER_ID);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoomIdNum) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchChatMessages(chatRoomIdNum);
        const receivedMessages = res?.data;
        setMessages(Array.isArray(receivedMessages) ? receivedMessages : []);
      } catch (e: any) {
        setError(e?.message ?? '메시지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [chatRoomIdNum]);

  useEffect(() => {
    if (liveMessages.length === 0) return;
    const latest = liveMessages[liveMessages.length - 1];
    setMessages(prev => [...prev, latest]);
  }, [liveMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatRoomIdNum) return;

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'chat');
      }

      const trimmedText = text.trim();
      if (!trimmedText && !imageUrl) return;

      sendMessage({ text: trimmedText, imageUrl });

      setText('');
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('❌ 이미지 업로드 또는 메시지 전송 실패:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="px-4 py-3 bg-white border-b shadow-sm">
        <h2 className="text-lg font-semibold">채팅방 #{chatRoomIdNum || '-'}</h2>
      </div>

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

      <div className="px-4 py-3 border-t bg-white">
        <form className="flex flex-col space-y-2" onSubmit={handleSend}>
          {imagePreview && (
            <div className="flex items-center justify-between">
              <img src={imagePreview} alt="미리보기" className="h-24 rounded-md border" />
              <button
                type="button"
                onClick={() => {
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="ml-2 px-2 py-1 text-sm text-red-500 hover:underline"
              >
                삭제
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
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
              disabled={!text.trim() && !imageFile}
            >
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;