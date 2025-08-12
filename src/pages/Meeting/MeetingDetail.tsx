import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TabBar, { type TabItem } from '../../components/common/TabBar';
import MeetingHome from './MeetingHome';
import MeetingFeed from './MeetingFeed';
import MeetingChat from './MeetingChat';
import apiClient from '../../api/client';
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
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* 고정된 탭바 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex">
          {meetingTabs.map(tab => {
            const isActive = defaultTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-4 text-base font-medium transition-all duration-200 cursor-pointer flex-1 text-center ${
                  isActive
                    ? 'text-brand-primary border-b-2 border-brand-primary'
                    : 'text-gray-600 hover:text-brand-primary border-b-2 border-transparent hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 - 탭바(50px) 높이만 제외 */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 50px)' }}>
        {meetingTabs.find(tab => tab.id === defaultTab)?.content}
      </div>
    </div>
  );
};

export default MeetingDetail;
