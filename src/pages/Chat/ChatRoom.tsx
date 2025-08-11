import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import MyChatMessage from '../../components/domain/chat/MyChatMessage';
import OtherChatMessage from '../../components/domain/chat/OtherChatMessage';

import { fetchChatMessages, deleteChatMessage } from '../../api/chat';
import { uploadImage } from '../../api/upload';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { ChatMessageDto } from '../../types/chat/chat.types';
import { getUserIdFromToken } from '../../utils/auth';
import { Image } from 'lucide-react';

const formatChatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const ChatRoom: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const chatRoomIdNum = Number(chatRoomId);

  const accessToken = localStorage.getItem('accessToken');
  const currentUserId = accessToken ? Number(getUserIdFromToken(accessToken)) : null;

  const [chatRoomName, setChatRoomName] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { messages: liveMessages, sendMessage } = useChatSocket(chatRoomIdNum, currentUserId!);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoomIdNum) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchChatMessages(chatRoomIdNum);
        const data = res?.data;
        if (data) {
          setChatRoomName(data.chatRoomName);
          setMessages(data.messages);
        } else {
          setChatRoomName('');
          setMessages([]);
        }
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

  if (!accessToken || !currentUserId || isNaN(currentUserId)) {
    return <div className="p-4 text-center text-red-500">로그인이 필요합니다.</div>;
  }

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

  const handleDeleteMessage = async (messageId: number) => {
    const confirm = window.confirm('이 메시지를 삭제하시겠습니까?');
    if (!confirm) return;
    try {
      await deleteChatMessage(messageId);
      setMessages(prev =>
        prev.map(m =>
          m.messageId === messageId
            ? { ...m, text: '(삭제된 메세지입니다.)', imageUrl: '', deleted: true }
            : m
        )
      );
    } catch (err) {
      alert('메시지 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden max-w-full w-full">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-2 w-full max-w-full">
        {loading && <div className="text-gray-400 text-sm">불러오는 중...</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {!loading &&
          !error &&
          messages.map((m, idx) => {
            const isMine = Number(m.senderId) === currentUserId;
            const showProfile = idx === 0 || messages[idx - 1].senderId !== m.senderId;

            const messageComponent = isMine ? (
              <MyChatMessage
                message={m.text}
                imageUrl={m.imageUrl}
                timestamp={formatChatTime(m.sentAt)}
                isRead={true}
                userId={m.senderId}
              />
            ) : (
              <OtherChatMessage
                profileImage={m.profileImage ?? undefined}
                username={m.senderNickname}
                message={m.text}
                imageUrl={m.imageUrl}
                timestamp={formatChatTime(m.sentAt)}
                showProfile={showProfile}
                userId={m.senderId}
              />
            );

            return (
              <div
                key={m.messageId}
                className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isMine && !m.deleted) handleDeleteMessage(m.messageId);
                }}
              >
                <div className="max-w-[75%] w-fit">{messageComponent}</div>
              </div>
            );
          })}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-2 sm:px-4 py-2 sm:py-3 border-t bg-white">
        <form className="flex flex-col space-y-2 w-full max-w-full" onSubmit={handleSend}>
          {imagePreview && (
            <div className="flex items-center justify-between">
              <img
                src={imagePreview}
                alt="미리보기"
                className="h-20 sm:h-24 rounded-md border"
              />
              <button
                type="button"
                onClick={() => {
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="ml-2 px-2 py-1 text-xs sm:text-sm text-red-500 hover:underline"
              >
                삭제
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 w-full">
            <label className="cursor-pointer flex items-center text-blue-500 hover:text-blue-700">
              <Image className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="메시지를 입력하세요"
              className="flex-1 min-w-0 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-full text-xs sm:text-sm hover:bg-blue-600 disabled:opacity-50"
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