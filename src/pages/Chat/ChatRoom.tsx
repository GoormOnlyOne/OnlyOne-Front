// src/pages/chat/ChatRoom.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import MyChatMessage from '../../components/domain/chat/MyChatMessage';
import OtherChatMessage from '../../components/domain/chat/OtherChatMessage';

import { fetchChatMessages, deleteChatMessage } from '../../api/chat';
import { uploadImage } from '../../api/upload';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { ChatMessageDto, ChatRoomMessageResponse } from '../../types/chat/chat.types';
import { getUserIdFromToken } from '../../utils/auth';
import { Image } from 'lucide-react';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

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

  // 무한 스크롤 관련
  const [hasMore, setHasMore] = useState(true);
  const [nextCursorId, setNextCursorId] = useState<number | null>(null);
  const [nextCursorAt, setNextCursorAt] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // 스크롤/위치 refs
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 알림 모달
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default');
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | undefined>(undefined);

  // 초기 로드
  useEffect(() => {
    if (!chatRoomIdNum) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 초기: 최신부터 size개 (커서 없음)
        const raw = await fetchChatMessages(chatRoomIdNum, { size: 50 });
        const page: ChatRoomMessageResponse =
          (raw as any)?.data?.data ?? (raw as any)?.data ?? raw;

        setChatRoomName(page.chatRoomName ?? '');
        setMessages(page.messages ?? []);
        setHasMore(!!page.hasMore);
        setNextCursorId(page.nextCursorId ?? null);
        setNextCursorAt(page.nextCursorAt ?? null);

        // 처음엔 하단으로 스크롤
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        });
      } catch (e: any) {
        setError(e?.message ?? '메시지를 불러오지 못했습니다.');
        setChatRoomName('');
        setMessages([]);
        setHasMore(false);
        setNextCursorId(null);
        setNextCursorAt(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatRoomIdNum]);

  // 라이브 메시지 수신
  useEffect(() => {
    if (!liveMessages.length) return;
    const latest = liveMessages[liveMessages.length - 1];

    setMessages(prev => [...prev, latest]);

    // 바닥 근처일 때만 자동 스크롤
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  }, [liveMessages]);

  // 이전 배치 로드 (커서 기반, 리스트 앞에 prepend)
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingMore || !chatRoomIdNum || nextCursorId == null || !nextCursorAt) return;

    setLoadingMore(true);
    const container = listRef.current;
    const prevHeight = container?.scrollHeight ?? 0;

    try {
      const raw = await fetchChatMessages(chatRoomIdNum, {
        size: 50,
        cursorId: nextCursorId,
        cursorAt: nextCursorAt,
      });
      const page: ChatRoomMessageResponse =
        (raw as any)?.data?.data ?? (raw as any)?.data ?? raw;

      // 서버가 오래→최신(ASC)로 주므로 앞에 붙인다
      setMessages(prev => [...(page.messages ?? []), ...prev]);
      setHasMore(!!page.hasMore);
      setNextCursorId(page.nextCursorId ?? null);
      setNextCursorAt(page.nextCursorAt ?? null);

      // 스크롤 위치 보정
      requestAnimationFrame(() => {
        const newHeight = container?.scrollHeight ?? 0;
        if (container) {
          container.scrollTop = newHeight - prevHeight;
        }
      });
    } catch (e) {
      console.error('이전 메시지 로드 실패:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, chatRoomIdNum, nextCursorId, nextCursorAt]);

  // 스크롤 핸들러: 맨 위 근처에서 loadOlder()
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || loadingMore) return;
    if (el.scrollTop <= 60) {
      loadOlder();
    }
  }, [loading, loadingMore, loadOlder]);

  // 스크롤 이벤트 바인딩
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!accessToken || !currentUserId || isNaN(currentUserId)) {
    return <div className="p-4 text-center text-red-500">로그인이 필요합니다.</div>;
  }

  // 전송
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatRoomIdNum) return;

    try {
      // 이미지 선택 시 텍스트 동시 입력 차단 (UX 레벨)
      if (imageFile && text.trim()) {
        setAlertMsg('이미지 전송 시 텍스트는 함께 보낼 수 없어요.');
        setAlertVariant('default');
        setIsAlertOpen(true);
        return;
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'chat'); // CDN URL
      }

      const trimmedText = text.trim();
      if (!trimmedText && !imageUrl) return;

      // 소켓 전송
      sendMessage({ text: trimmedText, imageUrl });

      // 입력 초기화
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

  // 파일 선택
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 삭제
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
        setOnAlertConfirm(undefined);
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
      {/* 리스트 */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2 sm:px-4 py-3 space-y-2 w-full max-w-full relative"
        aria-busy={loading}
      >
        {loading && <Loading overlay text="로딩 중..." />}

        {/* 상단 로딩 인디케이터: 과거 배치 로드 */}
        {loadingMore && (
          <div className="w-full flex justify-center py-2 text-xs text-neutral-500">
            로딩 중...
          </div>
        )}

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

      <Modal
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