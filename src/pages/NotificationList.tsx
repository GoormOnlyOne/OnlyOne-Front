import React, { useEffect, useState } from 'react';
import NotificationItem from '../components/notification/NotificationItem';
import type { Notification } from '../components/notification/NotificationType';

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'settlement',
    groupImageUrl: 'https://via.placeholder.com/40',
    groupName: '우리동네축구단',
    meetingName: '7월 정기 모임',
    amount: '₩12,000'
  },
  {
    id: 2,
    type: 'comment',
    groupImageUrl: 'https://via.placeholder.com/40',
    actorName: '철수',
    postTitle: '8월 모임 후기',
    commentText: '좋은 후기 감사합니다!'
  },
  {
    id: 3,
    type: 'like',
    groupImageUrl: 'https://via.placeholder.com/40',
    actorName: '영희',
    postTitle: '7월 사진'
  },
  {
    id: 4,
    type: 'chat',
    groupImageUrl: 'https://via.placeholder.com/40',
    actorName: '민지',
    chatRoomName: '축구단 채팅방',
    messageText: '내일 경기 준비됐어?'
  }
];

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 실제로는 fetch API 호출
    setNotifications(mockNotifications);
  }, []);

  const handleClick = (noti: Notification) => {
    console.log('알림 클릭:', noti);
    // e.g. 해당 모임/글/채팅방으로 라우팅
  };

  return (
    <div>
      {notifications.map(noti => (
        <NotificationItem
          key={noti.id}
          notification={noti}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

export default NotificationList;