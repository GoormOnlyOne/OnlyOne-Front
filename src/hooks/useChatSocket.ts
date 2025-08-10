import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { ChatMessageDto } from '../types/chat/chat.types';

type ChatMessagePayload = {
  text: string;
  imageUrl: string | null;
};

const IMAGE_PREFIX = 'IMAGE::';
const WS_ENDPOINT =
  (import.meta.env.VITE_WS_ENDPOINT as string | undefined)?.replace(/\/$/, '') ||
  'https://api.buddkit.p-e.kr/ws';

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

  useEffect(() => {
    roomRef.current = chatRoomId;
    setMessages([]);
  }, [chatRoomId]);

  useEffect(() => {
    isMountedRef.current = true;

    const connect = () => {
      cleanupSubscription();
      clearReconnectTimer();

      const socket = new SockJS(WS_ENDPOINT);
      const client = Stomp.over(socket);
      client.debug = () => {};
      client.heartbeat.outgoing = 20000;
      client.heartbeat.incoming = 0;

      client.onWebSocketClose = (evt) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        scheduleReconnect(`WebSocket closed: code=${evt.code}`);
      };

      client.onStompError = (frame) => {
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
          trySubscribe(client, roomRef.current);
        },
        (error: unknown) => {
          if (!isMountedRef.current) return;
          setIsConnecting(false);
          setIsConnected(false);
          setLastError(getErrorMessage(error));
          scheduleReconnect('connect() failed');
        }
      );
    };

    const trySubscribe = (client: CompatClient, roomId: number) => {
      cleanupSubscription();
      const dest = `/sub/chat/${roomId}/messages`;
      try {
        const sub = client.subscribe(dest, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            if (roomRef.current !== roomId) return;
            setMessages((prev) => [...prev, body]);
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
      const delay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt - 1));
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
          clientRef.current.disconnect(() => {
            cb?.();
          });
        } else {
          cb?.();
        }
      } catch {
        cb?.();
      }
    };

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
  }, []);

  const sendMessage = ({ text, imageUrl }: ChatMessagePayload) => {
    const client = clientRef.current;
    if (!client || !isConnected) return;
    const payloadText = imageUrl ? `${IMAGE_PREFIX}${imageUrl}` : text;
    try {
      client.send(
        `/pub/chat/${roomRef.current}/messages`,
        {},
        JSON.stringify({ userId: currentUserId, text: payloadText })
      );
    } catch (e) {
      console.error('❌ 메시지 전송 실패:', e);
    }
  };

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