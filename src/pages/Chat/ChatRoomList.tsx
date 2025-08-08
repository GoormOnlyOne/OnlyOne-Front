// src/pages/Chat/ChatRoomList.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchChatRoomList } from '../../api/chat';
import type { ChatRoomSummary } from '../../types/chat/chat.types';

const ChatRoomList = () => {
  const { id } = useParams<{ id: string }>();
  const clubId = Number(id);
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      return;
    }

    fetchChatRoomList(clubId)
      .then(res => {
        const roomList = res?.data;
        if (Array.isArray(roomList)) {
          setRooms(roomList);
        } else {
          console.warn("❗ 예상과 다른 응답 형식:", res);
          setRooms([]);
        }
      })
      .catch(err => {
        console.error("❌ API 에러:", err);
        setRooms([]);
      })
      .finally(() => setLoading(false));
  }, [clubId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">채팅방 목록</h2>

      {loading && <p>불러오는 중...</p>}
      {!loading && rooms.length === 0 && <p>채팅방이 없습니다.</p>}

      {!loading && rooms.length > 0 && (
        <ul className="space-y-4">
          {rooms.map(room => (
            <li key={room.chatRoomId} className="p-4 border rounded shadow-sm">
              <Link to={`/chat/${room.chatRoomId}/messages`}>
                <div className="font-semibold">
                  {room.type === 'CLUB' ? '전체 채팅' : room.chatRoomName}
                </div>
                <div className="text-sm text-gray-600">{room.lastMessageText}</div>
                <div className="text-xs text-gray-400">
                  {room.lastMessageTime &&
                    new Date(room.lastMessageTime).toLocaleString('ko-KR')}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatRoomList;