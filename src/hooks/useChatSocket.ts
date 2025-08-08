import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import type { ChatMessageDto } from '../types/chat/chat.types';

// 메시지 전송 시 사용할 payload 타입
type ChatMessagePayload = {
  text: string;
  imageUrl: string | null;
};

// 이미지 메시지 전송 시 prefix
const IMAGE_PREFIX = 'IMAGE::';

export const useChatSocket = (chatRoomId: number, currentUserId: number) => {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<CompatClient | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    clientRef.current = client;

    client.connect({}, () => {
      setIsConnected(true);
      client.subscribe(`/sub/chat/${chatRoomId}/messages`, (message) => {
        const body = JSON.parse(message.body);
        console.log('📨 수신 메시지:', body); // ← 여기에 imageUrl이 있는지 확인
        setMessages((prev) => [...prev, body]);
      });


    });

    return () => {
      client.disconnect(() => {
        setIsConnected(false);
      });
    };
  }, [chatRoomId]);

  // ✅ 백엔드에 맞춘 메시지 전송 로직
  const sendMessage = ({ text, imageUrl }: ChatMessagePayload) => {
    if (!clientRef.current || !isConnected) return;

    // 이미지가 있으면 text를 IMAGE::url 형식으로 변환
    const payloadText = imageUrl ? `${IMAGE_PREFIX}${imageUrl}` : text;

    clientRef.current.send(
      `/pub/chat/${chatRoomId}/messages`,
      {},
      JSON.stringify({
        userId: currentUserId,
        text: payloadText,
      })
    );
  };

  return { messages, sendMessage, isConnected };
};