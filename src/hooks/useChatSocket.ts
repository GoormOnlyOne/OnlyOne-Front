// src/hooks/useChatSocket.ts
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import type { ChatMessageDto } from '../types/chat/chat.types';

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
        setMessages((prev) => [...prev, body]);
      });
    });

    return () => {
      client.disconnect(() => {
        setIsConnected(false);
      });
    };
  }, [chatRoomId]);

  const sendMessage = (text: string) => {
    if (!clientRef.current || !isConnected) return;
    clientRef.current.send(
      `/pub/chat/${chatRoomId}/messages`,
      {},
      JSON.stringify({ userId: currentUserId, text })
    );
  };

  return { messages, sendMessage, isConnected };
};