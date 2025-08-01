import { createBrowserRouter } from 'react-router-dom';

// layout
import DefaultLayout from '../components/layout/default/Layout.tsx';
import SearchLayout from '../components/layout/search/Layout.tsx';
import TitleLayout from '../components/layout/title/Layout.tsx';

// page
import { Home } from '../pages/Home.tsx';
import { Category } from '../pages/Category/Category.tsx';
import { Meeting } from '../pages/Meeting/Meeting.tsx';
import { MeetingDetail } from '../pages/Meeting/MeetingDetail.tsx';
import { MeetingCreate } from '../pages/Meeting/MeetingCreate.tsx';
import { MeetingEdit } from '../pages/Meeting/MeetingEdit.tsx';
import { Search } from '../pages/Search.tsx';
import { Notice } from '../pages/Notice.tsx';
import { Login } from '../pages/Login.tsx';
import { Signup } from '../pages/Signup.tsx';
import { Mypage } from '../pages/Mypage/Mypage.tsx';
import { Interest } from '../pages/Mypage/Interest.tsx';
import { Profile } from '../pages/Mypage/Profile.tsx';
import { Settlement } from '../pages/Mypage/Settlement.tsx';
import  SettlementHistory from '../pages/Mypage/SettlementHistory.tsx'

import { ComponentGallery } from '../pages/ComponentGallery/ComponentGallery.tsx';

export const router = createBrowserRouter([
  // [기본] 레이아웃이 적용되는 라우트들
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'category',
        element: <Category />,
      },
      {
        path: 'meeting',
        element: <Meeting />,
      },
    ],
  },

  // [검색] 레이아웃이 적용되는 라우트들
  {
    path: '/search',
    element: <SearchLayout />,
    children: [
      {
        index: true,
        element: <Search />,
      },
    ]
  },

  // [타이틀] 레이아웃이 적용되는 라우트들
  {
    path: '/',
    element: <TitleLayout />,
    children: [
      {
        path: 'mypage',
        element: <Mypage />,
      },
      {
        path: 'mypage/interest',
        element: <Interest />,
      },
      {
        path: 'mypage/profile',
        element: <Profile />,
      },
      {
        path: 'mypage/settlement',
        element: <Settlement />,
      },
      {
        path: 'notice',
        element: <Notice />,
      },
      {
				path: 'meeting/:id',
				element: <MeetingDetail />
			},
      {
        path: 'meeting/create',
        element: <MeetingCreate />,
      },
      {
        path: 'meeting/edit/:id',
        element: <MeetingEdit />,
      },
      ,
      {
				path: 'settlementHistory',
				element: <SettlementHistory />
			},
    ]
  },

  // 레이아웃이 적용되지 않는 라우트들
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/components',
    element: <ComponentGallery />,
  },
]);