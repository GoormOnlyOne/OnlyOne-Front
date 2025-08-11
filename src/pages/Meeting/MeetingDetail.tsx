import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TabBar, { type TabItem } from '../../components/common/TabBar';
import MeetingHome from './MeetingHome';
import MeetingFeed from './MeetingFeed';
import MeetingChat from './MeetingChat';
import apiClient from '../../api/client';

export const MeetingDetail = () => {
  const { id: meetingId } = useParams<{ id: string }>();
  const [clubRole, setClubRole] = useState<'LEADER' | 'MEMBER' | 'GUEST' | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    const fetchMeetingInfo = async () => {
      try {
        const response = await apiClient.get(`/clubs/${meetingId}`);
        if (response.success) {
          setClubRole(response.data.clubRole);
        }
      } catch (error) {
        console.error('Failed to fetch meeting info:', error);
      }
    };

    fetchMeetingInfo();
  }, [meetingId]);

  const handleTabChange = (tabId: string) => {
    if (clubRole === 'GUEST' && (tabId === 'feed' || tabId === 'chat')) {
      alert('모임에 가입해야 볼 수 있습니다.');
      return false; // 탭 변경 방지
    }
    console.log('모임 탭 변경:', tabId);
    return true;
  };

  const meetingTabs: TabItem[] = [
    {
      id: 'home',
      label: '홈',
      content: <MeetingHome />,
    },
    {
      id: 'feed',
      label: '게시판',
      content: <MeetingFeed />,
    },
    {
      id: 'chat',
      label: '채팅',
      content: <MeetingChat />,
    },
  ];

  return (
    <div>
      <TabBar
        tabs={meetingTabs}
        defaultTab="home"
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export { MeetingDetail as default } from './MeetingDetail';
