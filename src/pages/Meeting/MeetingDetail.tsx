import TabBar, { type TabItem } from '../../components/common/TabBar';
import MeetingHome from './MeetingHome';
import MeetingFeed from './MeetingFeed';
import MeetingChat from './MeetingChat';

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

export const MeetingDetail = () => {
  return (
    <div>
      <TabBar
        tabs={meetingTabs}
        defaultTab="home"
        onTabChange={tabId => console.log('모임 탭 변경:', tabId)}
      />
    </div>
  );
};

export { MeetingDetail as default } from './MeetingDetail';