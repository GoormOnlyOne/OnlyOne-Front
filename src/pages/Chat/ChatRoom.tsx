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
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';


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

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default');
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | undefined>(undefined);

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
      setAlertMsg('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setAlertVariant('default');
      setIsAlertOpen(true);
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
    setAlertMsg('이 메시지를 삭제하시겠습니까?');
    setAlertVariant('default');
    setOnAlertConfirm(() => async () => {
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
        console.error('메시지 삭제 실패:', err);
        setAlertMsg('메시지 삭제에 실패했습니다.');
        setAlertVariant('default');
        setOnAlertConfirm(undefined); // 에러 알림은 확인만
        setIsAlertOpen(true);
        return;
      } finally {
        setIsAlertOpen(false);
        setOnAlertConfirm(undefined);
      }
    });
    setIsAlertOpen(true);
  };

  return (
  <div className="flex flex-col h-[calc(100dvh-56px)] bg-gray-50 overflow-hidden max-w-full w-full">
    {/* 채팅 메시지 영역 */}
    <div
      className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2 sm:px-4 py-3 space-y-2 w-full max-w-full relative"
      aria-busy={loading}
    >
        {/* ★ 변경: 공통 로딩(오버레이) */}
        {loading && <Loading overlay text="로딩 중..." />}

        {/* ★ 변경: 텍스트 로더 제거, 에러만 표시 */}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

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
      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white">
        <form className="flex flex-col space-y-2 w-full max-w-full" onSubmit={handleSend}>
          {imagePreview && (
            <div className="flex items-center justify-between">
              <img
                src={imagePreview}
                alt="미리보기"
                className="h-20 sm:h-24 rounded-md border border-[var(--color-brand-primary)]"
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
            {/* 이미지 업로드 버튼 */}
            <label className="cursor-pointer flex items-center text-[var(--color-brand-primary)] hover:text-[var(--color-brand-darker)]">
              <Image className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* 메시지 입력창 */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="메시지를 입력하세요"
              className="flex-1 min-w-0 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full text-xs sm:text-sm 
                        border-neutral-300 focus:outline-none 
                        focus:border-[var(--color-brand-primary)] 
                        focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-opacity-20"
            />

            {/* 전송 버튼 */}
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--color-brand-primary)] text-white rounded-full text-xs sm:text-sm 
                        hover:bg-[var(--color-brand-darker)] disabled:opacity-50"
              disabled={!text.trim() && !imageFile}
            >
              전송
            </button>
          </div>
        </form>
      </div>
      <Alert
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          setOnAlertConfirm(undefined);
        }}
        onConfirm={() => {
          if (onAlertConfirm) {
            onAlertConfirm();
          } else {
            setIsAlertOpen(false);
          }
        }}
        title={alertMsg}
        variant={alertVariant}
        cancelText="닫기"
        confirmText="확인"
      />
    </div>
  );
};

export default ChatRoom;