import { useEffect, useState } from 'react';
import { getNotifications, deleteNotification } from '../api/notification';
import type { Notification as NotificationApi } from '../types/notification';
import ListCard from '../components/common/ListCard';
import Loading from '../components/common/Loading';
import {
  MessageCircle,
  DollarSign,
  Heart,
  MessageSquare,
  Bell,
  Trash2,
  Repeat2, // 리피드 아이콘 추가
} from 'lucide-react';

export const Notice = () => {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const response = await getNotifications();
        console.log(response);

        // 첫 페이지 조회 시 모든 알림을 읽음 처리로 UI 업데이트
        const readNotifications = response.notifications.map(notification => ({
          ...notification,
          isRead: true, // 백엔드에서 자동으로 읽음 처리되므로 UI에서도 반영
        }));

        setNotifications(readNotifications);
        setUnreadCount(0); // 모든 알림이 읽음 처리되었으므로 0으로 설정
      } catch {
        setError('알림을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleClick = (notification: NotificationApi) => {
    // 알림 타입에 따른 라우팅 처리
  };

  const handleDelete = async (
    notification: NotificationApi,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지

    try {
      await deleteNotification({
        notificationId: notification.notificationId,
        userId: 1, // 임시로 userId=1 사용
      });

      // 삭제할 알림이 읽지 않은 상태였다면 unreadCount 감소
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // 알림 목록에서 제거
      setNotifications(prev =>
        prev.filter(n => n.notificationId !== notification.notificationId),
      );
    } catch {
      setError('알림 삭제에 실패했습니다.');
    }
  };

  // 알림 타입별 아이콘 컴포넌트 생성
  const getNotificationIcon = (type: string) => {
    const iconSize = 'w-6 h-6';
    const containerBase =
      'w-12 h-12 rounded-full flex items-center justify-center';

    switch (type) {
      case 'CHAT':
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <MessageCircle
              className={`${iconSize} text-[var(--color-brand-primary)]`}
            />
          </div>
        );
      case 'SETTLEMENT':
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <DollarSign
              className={`${iconSize} text-[var(--color-brand-primary)]`}
            />
          </div>
        );
      case 'LIKE':
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <Heart
              className={`${iconSize} text-[var(--color-brand-primary)]`}
            />
          </div>
        );
      case 'COMMENT':
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <MessageSquare
              className={`${iconSize} text-[var(--color-brand-primary)]`}
            />
          </div>
        );
      case 'REFEED':
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <Repeat2
              className={`${iconSize} text-[var(--color-brand-primary)]`}
            />
          </div>
        );
      default:
        return (
          <div
            className={`${containerBase} bg-[var(--color-brand-primary)]/20`}
          >
            <Bell className={`${iconSize} text-[var(--color-brand-primary)]`} />
          </div>
        );
    }
  };

  // 알림 타입별 한국어 텍스트 반환
  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'CHAT':
        return '채팅';
      case 'SETTLEMENT':
        return '정산';
      case 'LIKE':
        return '좋아요';
      case 'COMMENT':
        return '댓글';
      case 'REFEED': // 리피드 텍스트 추가
        return '리피드';
      default:
        return '알림';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    const baseStyle =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-medium font-medium';
    switch (type) {
      case 'CHAT':
        return `${baseStyle} bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] ring-1 ring-[var(--color-brand-primary)]/20`;
      case 'SETTLEMENT':
        return `${baseStyle} bg-red-500/10 text-red-600 ring-1 ring-red-500/20`;
      case 'LIKE':
        return `${baseStyle} bg-[var(--color-complement-blue)]/10 text-[var(--color-complement-blue)] ring-1 ring-[var(--color-complement-blue)]/20`;
      case 'COMMENT':
        return `${baseStyle} bg-[var(--color-complement-teal)]/10 text-[var(--color-complement-teal)] ring-1 ring-[var(--color-complement-teal)]/20`;
      case 'REFEED':
        return `${baseStyle} bg-[var(--color-brand-secondary)]/10 text-[var(--color-brand-secondary)] ring-1 ring-[var(--color-brand-secondary)]/20`;
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ko-KR');
  };

  const listItems = notifications.map(notification => ({
    id: notification.notificationId,
    title: notification.content,
    subtitle: formatDate(notification.createdAt),
    image: getNotificationIcon(notification.type),
    badge: {
      text: getNotificationTypeText(notification.type), // 한국어 텍스트 사용
      color: getNotificationTypeColor(notification.type),
    },
    rightContent: (
      <div className="flex items-center gap-2">
        {/* 휴지통 아이콘 버전 */}
        <button
          onClick={e => handleDelete(notification, e)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
          aria-label="알림 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    ),
    onClick: () => handleClick(notification),
  }));

  return (
    <div className="relative min-h-[160px]" aria-busy={loading}>
      {loading && <Loading overlay text="알림을 불러오는 중..." />}
      {/* 에러 배너 */}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {/* 읽지 않은 알림 배너 (로딩/에러 아닐 때만) */}
      {unreadCount > 0 && !loading && !error && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            읽지 않은 알림이 {unreadCount}개 있습니다.
          </p>
        </div>
      )}
      <ListCard
        className="mt-2"
        items={listItems}
        emptyMessage="알림이 없습니다."
        loading={loading}
      />
    </div>
  );
};
