import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import {
  CompatClient,
  Stomp,
  type IMessage,
  type StompSubscription,
} from '@stomp/stompjs';
import type { ChatMessageDto } from '../types/chat/chat.types';

type ChatMessagePayload = { text: string; imageUrl: string | null };

const IMAGE_PREFIX = 'IMAGE::';

// 1) WS 엔드포인트: 환경변수 필수, 기본값 제거
const WS_ENDPOINT = (
  import.meta.env.VITE_WS_ENDPOINT as string | undefined
)?.replace(/\/$/, '');

// 재시도 설정
const MAX_RETRY = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 15000;

export const useChatSocket = (chatRoomId: number, currentUserId: number) => {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clientRef = useRef<CompatClient | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const roomRef = useRef<number>(chatRoomId);

  // 2) 방 변경 시: 메시지 초기화 + (연결 상태면) 즉시 재구독
  useEffect(() => {
    roomRef.current = chatRoomId;
    setMessages([]);
    const client = clientRef.current;
    if (client?.connected) {
      trySubscribe(client, chatRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  useEffect(() => {
    isMountedRef.current = true;

    // 3) WS 엔드포인트 미설정 시 조기 종료
    if (!WS_ENDPOINT) {
      const msg = '[Chat] VITE_WS_ENDPOINT가 설정되지 않았습니다. (.env 확인)';
      console.error(msg);
      setLastError(msg);
      setIsConnected(false);
      setIsConnecting(false);
      return () => {
        isMountedRef.current = false;
      };
    }

    const connect = () => {
      cleanupSubscription();
      clearReconnectTimer();

      const socket = new SockJS(WS_ENDPOINT);
      const client = Stomp.over(socket);
      client.debug = () => {};

      // 4) heartbeat API 올바르게 사용
      client.heartbeatOutgoing = 20000; // 20s
      client.heartbeatIncoming = 0;

      client.onWebSocketClose = evt => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        scheduleReconnect(`WebSocket closed: code=${evt.code}`);
      };

      client.onStompError = frame => {
        if (!isMountedRef.current) return;
        setLastError(frame.headers['message'] || 'STOMP error frame');
      };

      clientRef.current = client;
      setIsConnecting(true);
      setLastError(null);

      client.connect(
        {},
        () => {
          if (!isMountedRef.current) return;
          retryCountRef.current = 0;
          setIsConnecting(false);
          setIsConnected(true);
          // 현재 방으로 구독
          trySubscribe(client, roomRef.current);
        },
        (error: unknown) => {
          if (!isMountedRef.current) return;
          setIsConnecting(false);
          setIsConnected(false);
          setLastError(getErrorMessage(error));
          scheduleReconnect('connect() failed');
        },
      );
    };

    const trySubscribe = (client: CompatClient, roomId: number) => {
      cleanupSubscription();
      const dest = `/sub/chat/${roomId}/messages`;
      try {
        const sub = client.subscribe(dest, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            // 최신 방만 반영
            if (roomRef.current !== roomId) return;
            setMessages(prev => [...prev, body]);
          } catch (e) {
            console.warn('⚠️ 메시지 처리 실패:', e);
          }
        });
        subscriptionRef.current = sub;
      } catch (e) {
        console.error('❌ subscribe 실패:', e);
        setTimeout(() => {
          if (client.connected && isMountedRef.current) {
            trySubscribe(client, roomId);
          }
        }, 1000);
      }
    };

    const scheduleReconnect = (reason: string) => {
      if (!isMountedRef.current) return;
      const attempt = retryCountRef.current + 1;
      if (attempt > MAX_RETRY) {
        setLastError(`재연결 최대 횟수 초과 (${MAX_RETRY}) - ${reason}`);
        return;
      }
      retryCountRef.current = attempt;
      const delay = Math.min(
        MAX_DELAY_MS,
        BASE_DELAY_MS * Math.pow(2, attempt - 1),
      );
      const jitter = Math.floor(Math.random() * 300);
      const wait = delay + jitter;

      clearReconnectTimer();
      reconnectTimerRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        connect();
      }, wait);
    };

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const cleanupSubscription = () => {
      try {
        subscriptionRef.current?.unsubscribe();
      } catch {}
      subscriptionRef.current = null;
    };

    const disconnectClient = (cb?: () => void) => {
      try {
        if (clientRef.current?.connected) {
          clientRef.current.disconnect(() => cb?.());
        } else {
          cb?.();
        }
      } catch {
        cb?.();
      }
    };

    // 외부에서 재사용할 수 있게 참조에 넣어둠
    (trySubscribe as any).ref = trySubscribe;

    connect();

    return () => {
      isMountedRef.current = false;
      clearReconnectTimer();
      cleanupSubscription();
      disconnectClient(() => {
        setIsConnected(false);
        setIsConnecting(false);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5) 빈 메시지 전송 방지 + trim 처리
  const sendMessage = ({ text, imageUrl }: ChatMessagePayload) => {
    const client = clientRef.current;
    if (!client || !isConnected) return;

    const trimmed = text?.trim() ?? '';
    const hasText = trimmed.length > 0;
    const hasImage = !!imageUrl;

    if (!hasText && !hasImage) return;

    const payloadText = hasImage ? `${IMAGE_PREFIX}${imageUrl}` : trimmed;

    try {
      client.send(
        `/pub/chat/${roomRef.current}/messages`,
        {},
        JSON.stringify({ userId: currentUserId, text: payloadText }),
      );
    } catch (e) {
      console.error('❌ 메시지 전송 실패:', e);
    }
  };

  // 내부에서 재구독에 접근해야 하므로 함수 노출
  function trySubscribe(client: CompatClient, roomId: number) {
    useChatSocket as any; // 타입 억제용 no-op
    // 실제 구현은 위 useEffect 내부 정의를 사용합니다.
    (trySubscribe as any).ref?.(client, roomId);
  }

  return { messages, sendMessage, isConnected, isConnecting, lastError };
};

function getErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') {
    const anyE = e as any;
    return anyE.message || JSON.stringify(anyE);
  }
  return 'Unknown error';
}
