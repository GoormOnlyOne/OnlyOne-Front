import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import MeetingCard from './MeetingCard';
import EmptyState from '../search/EmptyState';

interface Meeting {
	clubId: number;
	name: string;
	description: string;
	interest: string;
	district: string;
	memberCount: number;
	image: string;
	joined: boolean;
}

interface MeetingListProps {
	mode?: 'home' | 'full';
	apiEndpoint?: string;
	showHomeSpecialSections?: boolean;
}

export default function MeetingList({ mode = 'home', apiEndpoint, showHomeSpecialSections = false }: MeetingListProps) {
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [partnerMeetings, setPartnerMeetings] = useState<Meeting[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const navigate = useNavigate();

	// 데이터 로드 함수
	const loadMeetings = async (pageNum: number, isNewLoad = false) => {
		if (loading) return;

		setLoading(true);
		try {
			const endpoint = mode === 'full' ? apiEndpoint! : '/search/recommendations';
			const size = mode === 'full' ? 20 : 5;

			const response = await apiClient.get<Meeting[]>(endpoint, {
				params: { page: pageNum, size }
			});

			if (response.success) {
				const newMeetings = response.data;

				if (isNewLoad) {
					setMeetings(newMeetings);
				} else {
					setMeetings(prev => [...prev, ...newMeetings]);
				}

				if (newMeetings.length < size) {
					setHasMore(false);
				}
			}
		} catch (error) {
			console.error('모임 목록 조회 실패:', error);
		} finally {
			setLoading(false);
		}
	};

	// 함께하는 사람들의 모임 (특별 섹션이 활성화된 경우에만)
	const loadPartnerMeetings = async () => {
		if (!showHomeSpecialSections) return;

		try {
			const response = await apiClient.get<Meeting[]>('/search/teammates-clubs', {
				params: { page: 0, size: 5 }
			});
			if (response.success) {
				setPartnerMeetings(response.data);
			}
		} catch (error) {
			console.error('함께하는 사람들의 모임 조회 실패:', error);
		}
	};

	// 초기 데이터 로드
	useEffect(() => {
		loadMeetings(0, true);
		setPage(0);
		setHasMore(true);
		if (showHomeSpecialSections) {
			loadPartnerMeetings();
		}
	}, [mode, apiEndpoint, showHomeSpecialSections]);

	// 무한 스크롤 (전체 모드에서만)
	useEffect(() => {
		if (mode !== 'full') return;

		const handleScroll = () => {
			const scrollHeight = document.documentElement.scrollHeight;
			const scrollTop = document.documentElement.scrollTop;
			const clientHeight = document.documentElement.clientHeight;

			if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
				const nextPage = page + 1;
				setPage(nextPage);
				loadMeetings(nextPage);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [page, hasMore, loading, mode]);


	const handleViewMore = () => {
		navigate('/partner-meetings');
	};

	const handleViewMoreRecommended = () => {
		navigate('/recommended-meetings');
	};


	const handleJoinMeeting = (clubId: number) => {
		console.log(`모임 ${clubId}에 가입`);
		alert('모임 가입이 완료되었습니다!');
	};

	// 홈 모드 렌더링
	if (mode === 'home') {
		return (
			<div className="px-4 pb-20">
				{showHomeSpecialSections && (
					<>
						{/* 맞춤 추천 모임 섹션 */}
						<div>
							<h2 className="text-base font-semibold text-gray-800 leading-snug mb-4">
								내게 딱 맞는 모임을 찾아보세요!
							</h2>
							<div className="space-y-4">
								{meetings.map(meeting => (
									<MeetingCard key={meeting.clubId} meeting={meeting} />
								))}
							</div>

							{/* 더보기 버튼 */}
							<div className="flex justify-center mt-6 mb-8">
								<button
									onClick={handleViewMoreRecommended}
									className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
								>
									더보기 →
								</button>
							</div>
						</div>

						{/* 함께하는 사람들의 모임 섹션 */}
						<div className="mb-8">
							<h2 className="text-base font-semibold text-gray-800 leading-snug mb-4">
								모임 친구들은 이런 활동도 해요!
							</h2>

							<div className="space-y-4">
								{partnerMeetings.map(meeting => (
									<MeetingCard key={meeting.clubId} meeting={meeting} />
								))}
							</div>

							{/* 더보기 버튼 */}
							<div className="flex justify-center mt-6">
								<button
									onClick={handleViewMore}
									className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
								>
									더보기 →
								</button>
							</div>
						</div>
					</>
				)}
				
				{!showHomeSpecialSections && (
					<div className="space-y-4">
						{meetings.map(meeting => (
							<MeetingCard key={meeting.clubId} meeting={meeting} />
						))}
					</div>
				)}
			</div>
		);
	}

	// 전체 모드 렌더링
	return (
		<div className="h-[calc(100vh-56px)] overflow-y-auto bg-gray-50">
			{/* 모임 목록 */}
			<div className="px-4 py-6">
				<div className="space-y-4">
					{meetings.map(meeting => (
						<MeetingCard
							key={meeting.clubId}
							meeting={meeting}
							onJoinSuccess={handleJoinMeeting}
						/>
					))}
				</div>

				{/* 로딩 스피너 */}
				{loading && (
					<div className="flex justify-center py-8">
						<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
					</div>
				)}

				{/* 데이터가 없을 때 */}
				{!loading && meetings.length === 0 && (
					<EmptyState
						title="모임이 없습니다"
						description="새로운 모임을 만들어보시거나 다른 조건으로 검색해보세요"
						showCreateButton={true}
					/>
				)}
			</div>
		</div>
	);
}
