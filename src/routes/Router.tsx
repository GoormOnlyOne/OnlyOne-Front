import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from '../components/layout/default/Layout.tsx';
import { Home } from '../pages/Home/Home.tsx';
import { Category } from '../pages/Category/Category.tsx';
import { Meeting } from '../pages/Meeting/Meeting.tsx';
import { Mypage } from '../pages/Mypage/Mypage.tsx';
import { ComponentGallery } from '../pages/ComponentGallery/ComponentGallery.tsx';
import  NotificationList from '../pages/NotificationList.tsx';
import { MeetingDetail } from '../pages/Meeting/MeetingDetail.tsx';

export const router = createBrowserRouter([
  {
    // 레이아웃이 적용되는 라우트들
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
  // 레이아웃이 적용되지 않는 라우트들
  {
    path: '/components',
    element: <ComponentGallery />,
  },

  { 
    path: '/notificaionList',
    element: <NotificationList />,
  },
]);