import { createBrowserRouter } from 'react-router-dom';

// layout
import DefaultLayout from '../components/layout/default/Layout.tsx';
import SearchLayout from '../components/layout/search/Layout.tsx';
import TitleLayout from '../components/layout/title/Layout.tsx';

// page
import { Home } from '../pages/Home/Home.tsx';
import { Category } from '../pages/Category/Category.tsx';
import { Meeting } from '../pages/Meeting/Meeting.tsx';
import { MeetingDetail } from '../pages/Meeting/MeetingDetail.tsx';
import { Mypage } from '../pages/Mypage/Mypage.tsx';
import { Search } from '../pages/Search.tsx';
import { Login } from '../pages/Login.tsx';
import { Signup } from '../pages/Signup/Signup.tsx';
import { Notice } from '../pages/NotificationList.tsx';

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
      {
        path: 'mypage',
        element: <Mypage />,
      },
			{
				path: 'meeting/:id',
				element: <MeetingDetail />
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
        path: 'notice',
        element: <Notice />,
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