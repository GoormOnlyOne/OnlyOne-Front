import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TabBar, { type TabItem } from '../../components/common/TabBar';
import MeetingHome from './MeetingHome';
import MeetingFeed from './MeetingFeed';
import MeetingChat from './MeetingChat';
import apiClient from '../../api/client';
import Alert from '../../components/common/Alert';
import { showToast } from '../../components/common/Toast/ToastProvider';

export const MeetingDetail = () => {
  const { id: meetingId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubRole, setClubRole] = useState<'LEADER' | 'MEMBER' | 'GUEST' | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

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

  // 💡 URL 쿼리에서 탭 읽기 + 게스트 접근 제한 처리
  const requestedTab = (searchParams.get('tab') as 'home' | 'feed' | 'chat' | null) ?? null;
  const isRestricted = (t: string) => clubRole === 'GUEST' && t === 'chat';
  const defaultTab = requestedTab && !isRestricted(requestedTab) ? requestedTab : 'home';

  const handleTabChange = (tabId: string) => {
    if (clubRole === 'GUEST' && tabId === 'chat') {
      showToast('모임에 가입해서 대화를 나눠보세요.', 'warning', 2000);
      return false; // 탭 변경 방지
    }
    // URL 동기화: home이면 tab 제거, 그 외엔 설정
    const sp = new URLSearchParams(searchParams);
    if (tabId === 'home') sp.delete('tab');
    else sp.set('tab', tabId);
    setSearchParams(sp, { replace: true });
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
      content: <MeetingFeed readOnly={clubRole ==='GUEST'}/>
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
        key={`${defaultTab}-${clubRole ?? 'n'}`}   // 뒤로가기/쿼리 변경 시 리마운트 보장
        tabs={meetingTabs}
        defaultTab={defaultTab}                    // URL 기반 초기 탭
        onTabChange={handleTabChange}              // 변경 시 URL 반영
      />
    </div>
  );
};

export default MeetingDetail;
