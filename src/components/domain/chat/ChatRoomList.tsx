import React from 'react';

export type ChatRoomType = 'CLUB' | 'SCHEDULE';

export interface ChatRoom {
  id: number;
  type: ChatRoomType;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  memberCount?: number;
  unreadCount?: number;
}

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  onChatRoomClick?: (chatRoom: ChatRoom) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms,
  onChatRoomClick,
}) => {
  const handleChatRoomClick = (chatRoom: ChatRoom) => {
    onChatRoomClick?.(chatRoom);
  };

  if (chatRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <i className="ri-chat-3-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500 text-sm">
          아직 참여중인 채팅방이 없습니다.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-white">
      {chatRooms.map(chatRoom => (
        <div
          key={chatRoom.id}
          onClick={() => handleChatRoomClick(chatRoom)}
          className="flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          {/* 채팅방 아이콘 */}
          <div className="flex-shrink-0 mr-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i
                className={`${
                  chatRoom.type === 'SCHEDULE'
                    ? 'ri-calendar-event-line text-blue-600'
                    : 'ri-group-line text-blue-600'
                } text-xl`}
              ></i>
            </div>
          </div>

          {/* 채팅방 정보 */}
          <div className="flex-1 min-w-0">
            {/* 채팅방 제목과 시간 */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {chatRoom.name}
                </h3>
              </div>
              <div className="flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400">
                  {chatRoom.lastMessageTime
                    ? new Date(chatRoom.lastMessageTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            </div>

            {/* 마지막 메시지와 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">
                  {chatRoom.lastMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;
