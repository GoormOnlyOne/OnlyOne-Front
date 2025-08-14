import { useLocation } from 'react-router-dom';
import MeetingList from '../../components/domain/meeting/MeetingList';
import TabBar from '../../components/common/TabBar';
import MySettlement from '../Mypage/MySettlement';

type TabItem = { id: string; label: string; content: React.ReactNode };

const MyMeeting = () => {
  const location = useLocation();

  const handleTabChange = (tabId: string) => {
    console.log('탭 변경:', tabId);

    // 탭 변경 시 main 요소 스크롤 맨 위로
    const mainElement = document.querySelector('main');
    (mainElement ?? window).scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 네비게이션 상태에서 탭 정보를 받아서 기본 탭 설정
  const getDefaultTab = () => {
    return location.state?.activeTab || 'myMeeting';
  };

  const myMeetingTabs: TabItem[] = [
    { id: 'myMeeting', label: '내 모임', content: <MeetingList mode="my" /> },
    { id: 'mySettlement', label: '정산 요청 내역', content: <MySettlement /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 상단 탭바 고정 */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <TabBar
          tabs={myMeetingTabs}
          defaultTab={getDefaultTab()}
          onTabChange={handleTabChange}
        />
      </header>

      {/* 스크롤 타깃 */}
      <main className="flex-1 overflow-y-auto" />
    </div>
  );
};

export default MyMeeting;
