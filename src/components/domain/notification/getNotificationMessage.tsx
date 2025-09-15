import type { Notification } from './NotificationType';

export function getNotificationMessage(noti: Notification): string {
  switch (noti.type) {
    case 'settlement': // 혹시 알립 유형 인터페이스 수정되면 여기도 수정해야 할 것
      return `(${noti.groupName}): ${noti.meetingName}에서 정산이 ${noti.amount} 완료되었습니다.`;

    case 'comment':
      return `${noti.actorName}님이 "${noti.postTitle}"에 댓글을 남겼습니다: "${noti.commentText}"`;

    case 'like':
      return `${noti.actorName}님이 "${noti.postTitle}"을(를) 좋아합니다.`;

    case 'chat': // 그룹 안에 전체 채팅방, 여러 모임 채팅방, 리턴 메세지 수정해야 할수도
      return `${noti.actorName}님이 "${noti.chatRoomName}"에서 메시지를 보냈습니다: "${noti.messageText}"`;


      // 리피드 추가 될 것 같ㅌ음
    default:
      // 타입이 늘어나면 여기 못 오는 게 더 안전
      return '새 알림이 도착했습니다.';
  }
}
