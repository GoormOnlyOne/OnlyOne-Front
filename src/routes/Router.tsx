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
import { ParticipationStatus } from '../pages/Meeting/ParticipationStatus.tsx';
import { MeetingCreate } from '../pages/Meeting/MeetingCreate.tsx';
import { MeetingEdit } from '../pages/Meeting/MeetingEdit.tsx';
import MeetingScheduleCrate from '../pages/Meeting/MeetingScheduleCrate.tsx';
import MeetingScheduleEdit from '../pages/Meeting/MeetingScheduleEdit.tsx';
import { Search } from '../pages/Search.tsx';
import { Notice } from '../pages/Notice.tsx';
import { Login } from '../pages/Login.tsx';
import { Signup } from '../pages/Signup.tsx';
import KakaoCallback from '../pages/KakaoCallback.tsx';
import { Mypage } from '../pages/Mypage/Mypage.tsx';
import { Interest } from '../pages/Mypage/Interest.tsx';
import { Profile } from '../pages/Mypage/Profile.tsx';
import { Wallet } from '../pages/Mypage/Wallet.tsx';
import SettlementHistory from '../pages/Mypage/SettlementHistory.tsx';

import { ComponentGallery } from '../pages/ComponentGallery/ComponentGallery.tsx';
import MeetingFeedCreate from '../pages/Meeting/MeetingFeedCreate.tsx';
import MeetingFeedEdit from '../pages/Meeting/MeetingFeedEdit.tsx';
import MeetingFeedDetail from '../pages/Meeting/MeetingFeedDetail.tsx';
import PointCharge from '../pages/Payment/PointCharge.tsx';
import { Success } from '../pages/Payment/Success.tsx';
import { Checkout } from '../pages/Payment/Checkout.tsx';
import PartnerMeetings from '../pages/PartnerMeetings.tsx';
import RecommendedMeetings from '../pages/RecommendedMeetings.tsx';

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
		],
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
				path: 'mypage/wallet',
				element: <Wallet />,
			},
			{
				path: 'notice',
				element: <Notice />,
			},
			{
				path: 'meeting/:id',
				element: <MeetingDetail />,
			},
			{
				path: 'meeting/:meetingId/schedule/:scheduleId/participation',
				element: <ParticipationStatus />,
			},
			{
				path: 'meeting/create',
				element: <MeetingCreate />,
			},
			{
				path: 'meeting/:id/edit',
				element: <MeetingEdit />,
			},
			{
				path: 'meeting/:id/schedule/create',
				element: <MeetingScheduleCrate />,
			},
			{
				path: 'meeting/:meetingId/schedule/:scheduleId/edit',
				element: <MeetingScheduleEdit />,
			},
			{
				path: 'meeting/:meetingId/feed/create',
				element: <MeetingFeedCreate />,
			},
			{
				path: 'meeting/:meetingId/feed/:feedId/edit',
				element: <MeetingFeedEdit />,
			},
			{
				path: 'meeting/:meetingId/feed/:feedId',
				element: <MeetingFeedDetail />,
			},
			{
				path: 'settlementHistory',
				element: <SettlementHistory />,
			},
			{
				path: 'payment',
				element: <Checkout />,
			},
			{
				path: 'payment/charge',
				element: <PointCharge />,
			},
			{
				path: '/success',
				element: <Success />,
			},
			        {
        path: 'mypage/my-meetings',
        element: <MyMeeting />,
      },
			{
				path: '/partner-meetings',
				element: <PartnerMeetings />,
			},
			{
				path: '/recommended-meetings',
				element: <RecommendedMeetings />,
			},
		],
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
		path: '/kakao-callback',
		element: <KakaoCallback />,
	},
	{
		path: '/components',
		element: <ComponentGallery />,
	},
]);
