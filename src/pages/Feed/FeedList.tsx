import { useState, useEffect, useRef, useCallback } from 'react';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { BottomSheet } from '../../components/common/BottomSheet';
import { RefeedBottomSheet } from '../../components/common/RefeedBottomSheet';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';
import { useNavigate } from 'react-router-dom';
import CommentSection, {
	type Comment,
} from '../../components/common/CommentSection';
import userProfile from '../../assets/user_profile.jpg';
import apiClient from '../../api/client';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import SortChips from '../../components/common/SortChips';

import { type Meeting } from '../../components/domain/meeting/MeetingCard'

interface FeedData {
	clubId: number;
	feedId: number;
	content: string;
	imageUrls: string[];
	likeCount: number;
	commentCount: number;
	repostCount: number;
	nickname: string;
	profileImage?: string;
	created: string;
	comments?: Comment[];
	liked: boolean;
	feedMine: boolean;
	isRepost?: boolean;
	parentFeed?: {
		feedId: number;
		content: string;
		imageUrls: string[];
		likeCount: number;
		commentCount: number;
		repostCount: number;
		nickname: string;
		profileImage?: string;
		created: string;
		liked: boolean;
		feedMine: boolean;
		parentFeed?: any;
		rootFeed?: any;
	} | null;
	rootFeed?: {
		feedId: number;
		content: string;
		imageUrls: string[];
		likeCount: number;
		commentCount: number;
		repostCount: number;
		nickname: string;
		profileImage?: string;
		created: string;
		liked: boolean;
		feedMine: boolean;
		parentFeed?: any;
		rootFeed?: any;
	} | null;
}

interface FeedItemProps {
	feed: FeedData;
	onCommentClick: (feedId: number) => void;
	onLikeClick: (feedId: number) => void;
	onRefeedClick: (feedId: number) => void;
	onEditClick: (feedId: number, clubId: number) => void;
	onDeleteClick: (feedId: number) => void;
	onOriginalFeedClick: (clubId: number, feedId: number) => void;
}

const FeedItem = ({ feed, onCommentClick, onLikeClick, onRefeedClick, onEditClick, onDeleteClick, onOriginalFeedClick }: FeedItemProps) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [rootFeedImageIndex, setRootFeedImageIndex] = useState(0);

	// 날짜 포맷팅 함수
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const dateStr = date
			.toLocaleDateString('ko-KR', {
				month: '2-digit',
				day: '2-digit',
			})
			.replace(/\./g, '/')
			.replace(/\/$/, '')
			.replace(/\s/g, '');

		const timeStr = date.toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});

		return `${dateStr} ${timeStr}`;
	};

	const handlePrevImage = () => {
		setCurrentImageIndex(prev =>
			prev > 0 ? prev - 1 : feed.imageUrls.length - 1,
		);
	};

	const handleNextImage = () => {
		setCurrentImageIndex(prev =>
			prev < feed.imageUrls.length - 1 ? prev + 1 : 0,
		);
	};

	const handlePrevRootFeedImage = () => {
		if (!feed.rootFeed && !feed.parentFeed) return;
		const imageUrls =
			feed.rootFeed?.imageUrls || feed.parentFeed?.imageUrls || [];
		setRootFeedImageIndex(prev => (prev > 0 ? prev - 1 : imageUrls.length - 1));
	};

	const handleNextRootFeedImage = () => {
		if (!feed.rootFeed && !feed.parentFeed) return;
		const imageUrls =
			feed.rootFeed?.imageUrls || feed.parentFeed?.imageUrls || [];
		setRootFeedImageIndex(prev => (prev < imageUrls.length - 1 ? prev + 1 : 0));
	};

	return (
		<div
			className={`bg-white mb-4 shadow-sm ${!feed.isRepost ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
			onClick={!feed.isRepost ? (e) => {
				// 버튼 클릭이 아닌 경우에만 피드 상세로 이동
				if (!(e.target as Element).closest('button')) {
					e.stopPropagation();
					onOriginalFeedClick(feed.clubId, feed.feedId);
				}
			} : undefined}
		>
			{/* 피드 작성자 정보 */}
			<div className="flex items-center justify-between p-4 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
						<img
							src={feed.profileImage || userProfile}
							className="w-10 h-10 rounded-full"
							alt="프로필"
						/>
					</div>
					<div>
						<div className="text-sm font-medium">{feed.nickname}</div>
						<div className="text-xs text-gray-500">
							{formatDate(feed.created)}
						</div>
					</div>
				</div>
				{(feed.feedMine && !feed.isRepost) && (
					<div className="flex gap-2">
						<button
							onClick={() => onEditClick(feed.feedId, feed.clubId)}
							className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
						>
							수정
						</button>
						<button
							onClick={() => onDeleteClick(feed.feedId)}
							className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
						>
							삭제
						</button>
					</div>
				)}
			</div>

			{/* 이미지 캐러셀 또는 리피드 카드 */}
			<div className="relative">
				{/* 일반 피드: 이미지 캐러셀 */}
				{!feed.isRepost && (
					<div
						className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden"
						onTouchStart={e => {
							const touch = e.touches[0];
							e.currentTarget.dataset.startX = touch.clientX.toString();
						}}
						onTouchEnd={e => {
							const startX = parseFloat(e.currentTarget.dataset.startX || '0');
							const endX = e.changedTouches[0].clientX;
							const diff = startX - endX;

							if (Math.abs(diff) > 50) {
								if (diff > 0) {
									handleNextImage();
								} else {
									handlePrevImage();
								}
							}
						}}
					>
						{feed.imageUrls.length > 0 ? (
							<img
								src={feed.imageUrls[currentImageIndex]}
								alt={`피드 이미지 ${currentImageIndex + 1}`}
								className="w-full h-full object-cover"
								onError={e => {
									e.currentTarget.src = `https://picsum.photos/seed/picsum/200/300`;
								}}
							/>
						) : (
							<span className="text-gray-500">사진이 들어갑니다.</span>
						)}
					</div>
				)}

				{/* 리피드 카드 표시 */}
				{feed.isRepost && feed.parentFeed && (
					<div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
						{/* 2depth 리피드인 경우: PARENT FEED 정보가 ROOT FEED를 감쌈 */}
						{feed.rootFeed &&
							feed.rootFeed.feedId !== feed.parentFeed.feedId && (
								<>
									{/* Parent Feed 헤더 */}
									<div className="bg-gray-100 border-b border-gray-200 p-3">
										<div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
											<i className="ri-repeat-2-line"></i>
											<span>이 피드를 리피드함</span>
										</div>

										<div className="flex items-center gap-2.5">
											<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
												<img
													src={feed.parentFeed.profileImage || userProfile}
													className="w-8 h-8 rounded-full"
													alt="프로필"
												/>
											</div>
											<div>
												<div className="text-sm font-medium text-gray-700">
													{feed.parentFeed.nickname}
												</div>
												<div className="text-xs text-gray-500">
													{formatDate(feed.parentFeed.created)}
												</div>
											</div>
										</div>

										{/* Parent Feed 코멘트 */}
										{feed.parentFeed.content && (
											<div className="mt-2.5">
												<p className="text-sm text-gray-700 italic">
													"{feed.parentFeed.content}"
												</p>
											</div>
										)}
									</div>

									{/* ROOT FEED (깔끔한 스타일) */}
									<div
										className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-3 mb-3"
									>
										{/* rootFeed 작성자 정보 */}
										<div className="flex items-center justify-between p-4 border-b border-gray-100">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
													<img
														src={feed.rootFeed.profileImage || userProfile}
														className="w-10 h-10 rounded-full"
														alt="프로필"
													/>
												</div>
												<div>
													<div className="text-sm font-medium">
														{feed.rootFeed.nickname}
													</div>
													<div className="text-xs text-gray-500">
														{formatDate(feed.rootFeed.created)}
													</div>
												</div>
											</div>
										</div>

										{/* rootFeed 이미지 */}
										<div className="relative">
											<div
												className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
												onClick={(e) => {
													// 버튼이 아닌 경우에만 피드 상세로 이동
													if (!(e.target as Element).closest('button')) {
														e.stopPropagation();
														onOriginalFeedClick(feed.rootFeed.clubId, feed.rootFeed.feedId);
													}
												}}
												onTouchStart={e => {
													const touch = e.touches[0];
													e.currentTarget.dataset.startX =
														touch.clientX.toString();
												}}
												onTouchEnd={e => {
													const startX = parseFloat(
														e.currentTarget.dataset.startX || '0',
													);
													const endX = e.changedTouches[0].clientX;
													const diff = startX - endX;

													if (Math.abs(diff) > 50) {
														if (diff > 0) {
															handleNextRootFeedImage();
														} else {
															handlePrevRootFeedImage();
														}
													}
												}}
											>
												{feed.rootFeed.imageUrls.length > 0 ? (
													<img
														src={feed.rootFeed.imageUrls[rootFeedImageIndex]}
														alt={`rootFeed 이미지 ${rootFeedImageIndex + 1}`}
														className="w-full h-full object-cover"
														onError={e => {
															e.currentTarget.src = `https://picsum.photos/seed/picsum/200/300`;
														}}
													/>
												) : (
													<span className="text-gray-500">
														사진이 들어갑니다.
													</span>
												)}
											</div>

											{/* rootFeed 이미지 카운터 */}
											{feed.rootFeed.imageUrls.length > 1 && (
												<div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
													{rootFeedImageIndex + 1}/
													{feed.rootFeed.imageUrls.length}
												</div>
											)}

											{/* rootFeed 이미지 좌우 화살표 버튼 */}
											{feed.rootFeed.imageUrls.length > 1 && (
												<>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handlePrevRootFeedImage();
														}}
														className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
													>
														<i className="ri-arrow-left-wide-line"></i>
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleNextRootFeedImage();
														}}
														className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
													>
														<i className="ri-arrow-right-wide-line"></i>
													</button>
												</>
											)}

											{/* rootFeed 이미지 네비게이션 점들 */}
											{feed.rootFeed.imageUrls.length > 1 && (
												<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
													{feed.rootFeed.imageUrls.map((_, index) => (
														<button
															key={index}
															onClick={(e) => {
																e.stopPropagation();
																setRootFeedImageIndex(index);
															}}
															className={`w-1.5 h-1.5 rounded-full ${index === rootFeedImageIndex
																? 'bg-brand-primary'
																: 'bg-gray-300'
																}`}
														/>
													))}
												</div>
											)}
										</div>

										{/* rootFeed 내용 */}
										<div className="px-4 py-3">
											<p className="text-sm">{feed.rootFeed.content}</p>
										</div>

										{/* 여기에 rootFeed 좋아요/댓글 정보 추가 */}
										<div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100">
											<div className="flex items-center gap-1">
												<i className={`text-sm ${feed.rootFeed.liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-500'}`} />
												<span className="text-xs text-gray-600">{feed.rootFeed.likeCount}</span>
											</div>
											<div className="flex items-center gap-1">
												<i className="ri-chat-3-line text-sm text-gray-500" />
												<span className="text-xs text-gray-600">{feed.rootFeed.commentCount}</span>
											</div>
											<div className="flex items-center gap-1">
												<i className="ri-repeat-2-line text-sm text-gray-500" />
												<span className="text-xs text-gray-600">{feed.rootFeed.repostCount}</span>
											</div>
										</div>
									</div>
								</>
							)}

						{/* 1depth 리피드인 경우: 회색 배경으로 구분, 원본 정보만 표시 */}
						{(!feed.rootFeed ||
							feed.rootFeed.feedId === feed.parentFeed.feedId) && (
								<>
									{/* 원본 피드 카드 (회색 배경으로 감싸서 리피드임을 구분) */}
									<div className="bg-gray-100 p-3">
										{/* 리피드 표시 */}
										<div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
											<i className="ri-repeat-2-line"></i>
											<span>이 피드를 리피드함</span>
										</div>

										<div
											className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
										>
											{/* 원본 피드 작성자 정보 */}
											<div className="p-4 border-b border-gray-100">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
														<img
															src={feed.parentFeed.profileImage || userProfile}
															className="w-10 h-10 rounded-full"
															alt="프로필"
														/>
													</div>
													<div>
														<div className="text-sm font-medium">
															{feed.parentFeed.nickname}
														</div>
														<div className="text-xs text-gray-500">
															{formatDate(feed.parentFeed.created)}
														</div>
													</div>
												</div>
											</div>

											{/* 원본 피드 이미지 */}
											<div className="relative">
												<div
													className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
													onClick={(e) => {
														// 버튼이 아닌 경우에만 피드 상세로 이동
														if (!(e.target as Element).closest('button')) {
															e.stopPropagation();
															onOriginalFeedClick(feed.parentFeed.clubId, feed.parentFeed.feedId);
														}
													}}
													onTouchStart={e => {
														const touch = e.touches[0];
														e.currentTarget.dataset.startX =
															touch.clientX.toString();
													}}
													onTouchEnd={e => {
														const startX = parseFloat(
															e.currentTarget.dataset.startX || '0',
														);
														const endX = e.changedTouches[0].clientX;
														const diff = startX - endX;

														if (Math.abs(diff) > 50) {
															if (diff > 0) {
																handleNextRootFeedImage();
															} else {
																handlePrevRootFeedImage();
															}
														}
													}}
												>
													{feed.parentFeed.imageUrls.length > 0 ? (
														<img
															src={feed.parentFeed.imageUrls[rootFeedImageIndex]}
															alt={`피드 이미지 ${rootFeedImageIndex + 1}`}
															className="w-full h-full object-cover"
															onError={e => {
																e.currentTarget.src = `https://picsum.photos/seed/picsum/200/300`;
															}}
														/>
													) : (
														<span className="text-gray-500">
															사진이 들어갑니다.
														</span>
													)}
												</div>

												{/* 이미지 카운터 */}
												{feed.parentFeed.imageUrls.length > 1 && (
													<div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
														{rootFeedImageIndex + 1}/
														{feed.parentFeed.imageUrls.length}
													</div>
												)}

												{/* 이미지 좌우 화살표 버튼 */}
												{feed.parentFeed.imageUrls.length > 1 && (
													<>
														<button
															onClick={(e) => {
																e.stopPropagation();
																handlePrevRootFeedImage();
															}}
															className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
														>
															<i className="ri-arrow-left-wide-line"></i>
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleNextRootFeedImage();
															}}
															className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
														>
															<i className="ri-arrow-right-wide-line"></i>
														</button>
													</>
												)}

												{/* 이미지 네비게이션 점들 */}
												{feed.parentFeed.imageUrls.length > 1 && (
													<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
														{feed.parentFeed.imageUrls.map((_, index) => (
															<button
																key={index}
																onClick={(e) => {
																	e.stopPropagation();
																	setRootFeedImageIndex(index);
																}}
																className={`w-1.5 h-1.5 rounded-full ${index === rootFeedImageIndex
																	? 'bg-brand-primary'
																	: 'bg-gray-300'
																	}`}
															/>
														))}
													</div>
												)}
											</div>

											{/* 원본 피드 내용 */}
											<div className="px-4 py-3">
												<p className="text-sm">{feed.parentFeed.content}</p>
											</div>

											{/* 여기에 rootFeed 좋아요/댓글 정보 추가 */}
											<div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100">
												<div className="flex items-center gap-1">
													<i className={`text-sm ${feed.parentFeed.liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-500'}`} />
													<span className="text-xs text-gray-600">{feed.parentFeed.likeCount}</span>
												</div>
												<div className="flex items-center gap-1">
													<i className="ri-chat-3-line text-sm text-gray-500" />
													<span className="text-xs text-gray-600">{feed.parentFeed.commentCount}</span>
												</div>
												<div className="flex items-center gap-1">
													<i className="ri-repeat-2-line  text-sm text-gray-500" />
													<span className="text-xs text-gray-600">{feed.parentFeed.repostCount}</span>
												</div>
											</div>
										</div>
									</div>
								</>
							)}
					</div>
				)}

				{/* 일반 피드 - 이미지 카운터 */}
				{!feed.isRepost && feed.imageUrls.length > 1 && (
					<div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
						{currentImageIndex + 1}/{feed.imageUrls.length}
					</div>
				)}

				{/* 일반 피드 - 좌우 화살표 버튼 */}
				{!feed.isRepost && feed.imageUrls.length > 1 && (
					<>
						<button
							onClick={handlePrevImage}
							className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 text-xl"
						>
							<i className="ri-arrow-left-wide-line"></i>
						</button>
						<button
							onClick={handleNextImage}
							className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 text-xl"
						>
							<i className="ri-arrow-right-wide-line"></i>
						</button>
					</>
				)}

				{/* 일반 피드 - 이미지 네비게이션 점들 */}
				{!feed.isRepost && feed.imageUrls.length > 1 && (
					<div className="flex justify-center gap-2 py-4">
						{feed.imageUrls.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentImageIndex(index)}
								className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-brand-primary' : 'bg-gray-300'}`}
							/>
						))}
					</div>
				)}
			</div>

			{/* 피드 내용 */}
			<div className="px-4 py-3">
				<p className="text-sm">{feed.content}</p>
			</div>

			{/* 좋아요와 댓글 버튼과 리피드 버튼 */}
			<div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
				<button
					className="flex items-center gap-2"
					onClick={() => onLikeClick(feed.feedId)}
				>
					<i
						className={`text-xl ${feed.liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'}`}
					/>
					<span className="text-sm">{feed.likeCount}</span>
				</button>
				<button
					className="flex items-center gap-2"
					onClick={() => onCommentClick(feed.feedId)}
				>
					<i className="ri-chat-3-line text-xl" />
					<span className="text-sm">{feed.commentCount}</span>
				</button>
				<button
					className="flex items-center gap-2"
					onClick={() => onRefeedClick(feed.feedId)}
				>
					<i className="ri-repeat-2-line text-xl" />
					<span className="text-sm">{feed.repostCount}</span>
				</button>
			</div>
		</div>
	);
};

export const FeedList = () => {
	const navigate = useNavigate();
	const [feeds, setFeeds] = useState<FeedData[]>([]);
	const [loading, setLoading] = useState(true);
	const [commentBottomSheetOpen, setCommentBottomSheetOpen] = useState(false);
	const [refeedBottomSheetOpen, setRefeedBottomSheetOpen] = useState(false);
	const [selectedFeed, setSelectedFeed] = useState<FeedData | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedDeleteFeedId, setSelectedDeleteFeedId] = useState<number | null>(null);
	const [moveToMeetingModalOpen, setMoveToMeetingModalOpen] = useState(false);
	const [selectedMeetingInfo, setSelectedMeetingInfo] = useState<{ clubId: number, feedId: number } | null>(null);
	const likeSendingRef = useRef<Set<number>>(new Set());
	const bottomSheetScrollRef = useRef<HTMLDivElement>(null);
	type SortMode = 'latest' | 'popular';
	const [sortMode, setSortMode] = useState<SortMode>('latest');
	const [selectedRefeedFeedId, setSelectedRefeedFeedId] = useState<number | null>(null);


	const fetchFeeds = useCallback(async () => {
		try {
			setLoading(true);

			const path = sortMode === 'popular' ? '/feeds/popular' : '/feeds';
			const response = await apiClient.get(`${path}?page=0&limit=20`);

			// API 응답 데이터를 FeedData 형태로 변환
			const rawFeeds =
				response.data?.data || response.data?.content || response.data || [];

			const feedsData = rawFeeds.map((feed: any) => ({
				...feed,
				comments: [], // API에서 댓글은 별도로 로드
				isRepost: !!(feed.parentFeed || feed.rootFeed), // repost 여부 판단
			}));

			setFeeds(feedsData);
		} catch (error) {
			console.error('피드 로드 실패:', error);
			setFeeds([]);
		} finally {
			setLoading(false);
		}
	}, [sortMode]);

	useEffect(() => {
		fetchFeeds();
	}, [fetchFeeds]);

	const handleRefeedClick = (feedId: number) => {
		setSelectedRefeedFeedId(feedId);
		setRefeedBottomSheetOpen(true);
	};

	// 리피드 확인 핸들러
	const handleRefeedConfirm = async (selectedClub: Meeting, refeedContent: string) => {
		if (!selectedRefeedFeedId) return;

		try {
			// 리피드 API 호출
			const response = await apiClient.post(`/feeds/${selectedRefeedFeedId}/${selectedClub.clubId}`, {
				content: refeedContent
			});

			console.log('리피드 성공!');
			globalToast('리피드가 완료되었습니다.', 'success', 2000);
			setRefeedBottomSheetOpen(false);
			setSelectedRefeedFeedId(null);

			// 피드 목록 새로고침
			await fetchFeeds();
		} catch (error) {
			console.error('리피드 실패:', error);
			showApiErrorToast(error);
		}
	};

	// 피드 수정 핸들러
	const handleEditClick = (feedId: number, clubId: number) => {
		navigate(`/meeting/${clubId}/feed/${feedId}/edit`);
	};

	// 피드 삭제 클릭 핸들러
	const handleDeleteClick = (feedId: number) => {
		setSelectedDeleteFeedId(feedId);
		setDeleteModalOpen(true);
	};

	// 피드 삭제 확인 핸들러
	const handleDeleteConfirm = async () => {
		if (!selectedDeleteFeedId) return;

		try {
			const feedToDelete = feeds.find(f => f.feedId === selectedDeleteFeedId);
			if (!feedToDelete) return;

			await apiClient.delete(`/clubs/${feedToDelete.clubId}/feeds/${selectedDeleteFeedId}`);

			// 피드 목록에서 삭제된 피드 제거
			setFeeds(prev => prev.filter(feed => feed.feedId !== selectedDeleteFeedId));

			globalToast('피드가 삭제되었습니다.', 'success', 2000);
			setDeleteModalOpen(false);
			setSelectedDeleteFeedId(null);
		} catch (error) {
			console.error('피드 삭제 실패:', error);
			showApiErrorToast(error);
		}
	};

	// 원본 피드 클릭 핸들러
	const handleOriginalFeedClick = (clubId: number, feedId: number) => {
		setSelectedMeetingInfo({ clubId, feedId });
		setMoveToMeetingModalOpen(true);
	};

	// 모임 이동 확인 핸들러
	const handleMoveToMeetingConfirm = () => {
		if (!selectedMeetingInfo) return;

		navigate(`/meeting/${selectedMeetingInfo.clubId}`);
		setMoveToMeetingModalOpen(false);
		setSelectedMeetingInfo(null);
	};


	// 좋아요 처리
	const handleLikeClick = async (feedId: number) => {
		// 이미 처리 중인 피드인지 확인
		if (likeSendingRef.current.has(feedId)) return;

		// 처리 중 목록에 추가
		likeSendingRef.current.add(feedId);

		try {
			// 현재 피드 찾기
			const currentFeed = feeds.find(f => f.feedId === feedId);
			if (!currentFeed) return;

			// 즉시 UI 업데이트 (Optimistic Update)
			const currentLiked = currentFeed.liked;
			const currentLikeCount = currentFeed.likeCount;

			setFeeds(prev =>
				prev.map(feed =>
					feed.feedId === feedId
						? {
							...feed,
							liked: !feed.liked,
							likeCount: !feed.liked
								? feed.likeCount + 1
								: Math.max(0, feed.likeCount - 1),
						}
						: feed,
				),
			);

			// API 호출
			await apiClient.put(`/clubs/${currentFeed.clubId}/feeds/${feedId}/likes`);
		} catch (error) {
			// 실패 시 원래 상태로 롤백
			const currentFeed = feeds.find(f => f.feedId === feedId);
			if (currentFeed) {
				setFeeds(prev =>
					prev.map(feed =>
						feed.feedId === feedId
							? {
								...feed,
								liked: !currentFeed.liked,
								likeCount: !currentFeed.liked
									? currentFeed.likeCount - 1
									: currentFeed.likeCount + 1,
							}
							: feed,
					),
				);
			}
			showApiErrorToast(error);
			console.error('좋아요 처리 실패:', error);
		} finally {
			// 처리 중 목록에서 제거
			likeSendingRef.current.delete(feedId);
		}
	};

	const handleCommentClick = async (feedId: number) => {
		const feed = feeds.find(f => f.feedId === feedId);
		if (!feed) {
			return;
		}

		// 초기화
		setSelectedFeed({
			...feed,
			comments: [], // 로딩 중에는 빈 배열
		});
		setCommentBottomSheetOpen(true);

		try {
			// 댓글 목록 로드
			const response = await apiClient.get(
				`/feeds/${feedId}/comments?page=0&limit=20`,
			);
			const comments =
				response.data?.content || response.data?.data || response.data || [];

			// 댓글을 포함한 피드 정보 업데이트
			setSelectedFeed({
				...feed,
				comments: comments,
			});
		} catch (error) {
			console.error('댓글 로딩 실패:', error);
			// 에러 시 빈 댓글로 표시
			setSelectedFeed({
				...feed,
				comments: [],
			});
		}
	};

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50">
				<Loading text="피드를 불러오는 중..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="z-10 bg-white px-4 pt-3 pb-2">
				<SortChips value={sortMode} onChange={setSortMode} />
			</div>
			{/* 피드 리스트 */}
			<div className="pb-4">
				{feeds.map(feed => (
					<FeedItem
						key={feed.feedId}
						feed={feed}
						onCommentClick={handleCommentClick}
						onLikeClick={handleLikeClick}
						onRefeedClick={handleRefeedClick}
						onEditClick={handleEditClick}
						onDeleteClick={handleDeleteClick}
						onOriginalFeedClick={handleOriginalFeedClick}
					/>
				))}
			</div>

			{/* 맨 위로 가기 버튼 */}
			<ScrollToTopButton />

			{/* 댓글 바텀시트 */}
			<BottomSheet
				isOpen={commentBottomSheetOpen}
				onClose={() => {
					setCommentBottomSheetOpen(false);
					setSelectedFeed(null);
				}}
				title="댓글"
				maxHeight="60vh"
				scrollRef={bottomSheetScrollRef}
			>
				{selectedFeed && (
					<CommentSection
						clubId={selectedFeed.clubId}
						feedId={selectedFeed.feedId}
						comments={selectedFeed.comments || []}
						onCommentsUpdate={(comments, count) => {
							const updatedFeed = {
								...selectedFeed,
								comments: comments,
								commentCount: count,
							};
							setSelectedFeed(updatedFeed);
							setFeeds(prev =>
								prev.map(feed =>
									feed.feedId === selectedFeed.feedId ? updatedFeed : feed,
								),
							);

							// 댓글이 추가되었을 때 (개수가 증가했을 때) 스크롤을 맨 아래로
							if (
								count > selectedFeed.commentCount &&
								bottomSheetScrollRef.current
							) {
								setTimeout(() => {
									if (bottomSheetScrollRef.current) {
										bottomSheetScrollRef.current.scrollTop =
											bottomSheetScrollRef.current.scrollHeight;
									}
								}, 100);
							}
						}}
						enableInfiniteScroll={true}
						showAsBottomSheet={true}
					/>
				)}
			</BottomSheet>


			{/* 리피드 바텀시트 */}
			<RefeedBottomSheet
				isOpen={refeedBottomSheetOpen}
				onClose={() => {
					setRefeedBottomSheetOpen(false);
					setSelectedRefeedFeedId(null);
				}}
				onConfirm={handleRefeedConfirm}
				feedId={selectedRefeedFeedId}
			/>

			{/* 피드 삭제 확인 모달 */}
			<Modal
				isOpen={deleteModalOpen}
				onClose={() => {
					setDeleteModalOpen(false);
					setSelectedDeleteFeedId(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="피드를 삭제하시겠습니까?"
			/>

			{/* 모임 이동 확인 모달 */}
			<Modal
				isOpen={moveToMeetingModalOpen}
				onClose={() => {
					setMoveToMeetingModalOpen(false);
					setSelectedMeetingInfo(null);
				}}
				onConfirm={handleMoveToMeetingConfirm}
				title="해당 모임으로 이동하시겠습니까?"
			/>
		</div>
	);
};

export default FeedList;
