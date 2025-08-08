// src/pages/ChatList.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoomList from '../../components/domain/chat/ChatRoomList';
import type { ChatRoom } from '../../components/domain/chat/ChatRoomList';



const dummyChatRooms: ChatRoom[] = [
  {
    id: 1,
    type: 'CLUB',
    name: '시니어 여행 모임',
    lastMessage: '다음 모임 언제인가요?',
    lastMessageTime: new Date('2025-08-03T14:21:00'),
    memberCount: 10,
    unreadCount: 2,
  },
  {
    id: 2,
    type: 'SCHEDULE',
    name: '건강관리 모임',
    lastMessage: '걷기 인증했어요!',
    lastMessageTime: new Date('2025-08-03T12:05:00'),
    memberCount: 8,
    unreadCount: 0,
  },
];

const ChatList = () => {
  const navigate = useNavigate();

  const handleChatRoomClick = (chatRoom: ChatRoom) => {
    navigate(`/chat/${chatRoom.id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">채팅 목록</h1>
      <ChatRoomList chatRooms={dummyChatRooms} onChatRoomClick={handleChatRoomClick} />
    </div>
  );
};

export default ChatList;
