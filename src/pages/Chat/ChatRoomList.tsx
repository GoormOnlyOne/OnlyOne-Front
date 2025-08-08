import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChatRoomList } from '../../api/chat';
import type { ChatRoomSummary } from '../../types/chat/chat.types';

const ChatRoomList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const handleRoomClick = (roomId: number) => {
    navigate(`/chat/${roomId}/messages`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">채팅방 목록</h2>

      {loading && <p className="text-gray-500">불러오는 중...</p>}

      {!loading && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <i className="ri-chat-3-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500 text-sm">아직 참여중인 채팅방이 없습니다.</p>
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="bg-white">
          {rooms.map(room => (
            <div
              key={room.chatRoomId}
              onClick={() => handleRoomClick(room.chatRoomId)}
              className="flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* 아이콘 */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i
                    className={`${
                      room.type === 'SCHEDULE'
                        ? 'ri-calendar-event-line text-blue-600'
                        : 'ri-group-line text-blue-600'
                    } text-xl`}
                  ></i>
                </div>
              </div>

              {/* 채팅방 정보 */}
              <div className="flex-1 min-w-0">
                {/* 제목 + 시간 */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {room.chatRoomName}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2">
                    {room.lastMessageTime &&
                      new Date(room.lastMessageTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>

                {/* 마지막 메시지 */}
                <p className="text-sm text-gray-600 truncate">
                  {room.lastMessageText ?? '메시지가 없습니다.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;