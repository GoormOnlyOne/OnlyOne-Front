import { createBrowserRouter } from 'react-router-dom';

// Layouts
import DefaultLayout from '../components/layout/default/Layout.tsx';
import SearchLayout from '../components/layout/search/Layout.tsx';
import TitleLayout from '../components/layout/title/Layout.tsx';

// Pages
import { Home } from '../pages/Home.tsx';
import { Category } from '../pages/Category/Category.tsx';
import { Meeting } from '../pages/Meeting/Meeting.tsx';
import { MeetingDetail } from '../pages/Meeting/MeetingDetail.tsx';
import { ParticipationStatus } from '../pages/Meeting/ParticipationStatus.tsx';
import { MeetingCreate } from '../pages/Meeting/MeetingCreate.tsx';
import { MeetingEdit } from '../pages/Meeting/MeetingEdit.tsx';
import MeetingScheduleCrate from '../pages/Meeting/MeetingScheduleCrate.tsx';
import MeetingScheduleEdit from '../pages/Meeting/MeetingScheduleEdit.tsx';
import { Search } from '../pages/Search.tsx';
import { Notice } from '../pages/Notice.tsx';
import { Login } from '../pages/Login.tsx';
import { Signup } from '../pages/Signup.tsx';
import { Mypage } from '../pages/Mypage/Mypage.tsx';
import { Interest } from '../pages/Mypage/Interest.tsx';
import { Profile } from '../pages/Mypage/Profile.tsx';
import { Settlement } from '../pages/Mypage/Settlement.tsx';

import { ComponentGallery } from '../pages/ComponentGallery/ComponentGallery.tsx';
import MeetingFeedCreate from '../pages/Meeting/MeetingFeedCreate.tsx';
import MeetingFeedEdit from '../pages/Meeting/MeetingFeedEdit.tsx';
import MeetingFeedDetail from '../pages/Meeting/MeetingFeedDetail.tsx';

import ChatRoom from '../pages/Chat/ChatRoom.tsx';
import ChatRoomList from '../pages/Chat/ChatRoomList';


export const router = createBrowserRouter([
  // ✅ 기본 레이아웃
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'category', element: <Category /> },
      { path: 'meeting', element: <Meeting /> },
    ],
  },

  // ✅ 검색 레이아웃
  {
    path: '/search',
    element: <SearchLayout />,
    children: [{ index: true, element: <Search /> }],
  },

  // ✅ TitleLayout 적용되는 라우트
  {
    path: '/',
    element: <TitleLayout />,
    children: [
      { path: 'mypage', element: <Mypage /> },
      { path: 'mypage/interest', element: <Interest /> },
      { path: 'mypage/profile', element: <Profile /> },
      { path: 'mypage/settlement', element: <Settlement /> },
      { path: 'notice', element: <Notice /> },
      { path: 'meeting/create', element: <MeetingCreate /> },
      { path: 'meeting/:id', element: <MeetingDetail /> },
      { path: 'meeting/:id/edit', element: <MeetingEdit /> },
      { path: 'meeting/:id/schedule/create', element: <MeetingScheduleCrate /> },
      { path: 'meeting/:meetingId/schedule/:scheduleId/participation', element: <ParticipationStatus /> },
      { path: 'meeting/:meetingId/schedule/:scheduleId/edit', element: <MeetingScheduleEdit /> },
      { path: 'meeting/:meetingId/feed/create', element: <MeetingFeedCreate /> },
      { path: 'meeting/:meetingId/feed/:feedId/edit', element: <MeetingFeedEdit /> },
      { path: 'meeting/:meetingId/feed/:feedId', element: <MeetingFeedDetail /> },

      {
        path: 'chat/:chatRoomId/messages',
        element: <ChatRoom />,
      },
      {
        path: 'clubs/:clubId/chat',
        element: <ChatRoomList />,
      },
    ],
  },

  // ✅ 레이아웃 없이
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/components', element: <ComponentGallery /> },
]);
