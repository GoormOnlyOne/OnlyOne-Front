import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../../api/client';
import { Link } from 'react-router-dom';
import EmptyState from '../search/EmptyState';

interface FeedItem {
	id: number;
	imageUrl: string;
	likeCount: number;
	commentCount: number;
}

interface FeedSummaryDto {
	feedId: number;
	thumbnailUrl: string;
	likeCount: number;
	commentCount: number;
}

interface PageResponse<T> {
	content: T[];
}

interface CommonResponse<T> {
	success: boolean;
	data: T;
}

interface MeetingFeedGridProps {
	clubId: string;
}

// 숫자 포맷: 1.2K처럼 compact
const formatCount = (n: number) =>
	Intl.NumberFormat('en', {
		notation: 'compact',
		maximumFractionDigits: 1,
	}).format(n);

const MeetingFeedGrid: React.FC<MeetingFeedGridProps> = ({ clubId }) => {
	const [items, setItems] = useState<FeedItem[]>([]);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const [firstLoaded, setFirstLoaded] = useState(false);
	const [firstPageEmpty, setFirstPageEmpty] = useState(false);

	const loadingRef = useRef(false);

	const loadMore = useCallback(() => {
		if (loadingRef.current || !hasMore) return;
		loadingRef.current = true;
		setLoading(true);

		apiClient
			.get<CommonResponse<PageResponse<FeedSummaryDto>>>(
				`/clubs/${clubId}/feeds?page=${page}&limit=20`,
			)
			.then(response => {
				const content = response?.data?.content ?? [];
				if (page === 1) {
					setFirstLoaded(true);
					setFirstPageEmpty(content.length === 0);
				}

				if (content.length < 20) {
					setHasMore(false);
				}

				setItems(prev => {
					const existingIds = new Set(prev.map(i => i.id));
					const newOnes = content
						.filter(dto => !existingIds.has(dto.feedId))
						.map(dto => ({
							id: dto.feedId,
							imageUrl: dto.thumbnailUrl,
							likeCount: dto.likeCount,
							commentCount: dto.commentCount,
						}));
					return [...prev, ...newOnes];
				});

				setPage(prev => prev + 1);
			})
			.catch(err => console.error('피드 로드 실패:', err))
			.finally(() => {
				loadingRef.current = false;
				setLoading(false);
			});
	}, [clubId, page, hasMore]);

	useEffect(() => {
		loadMore();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const handleScroll = (e: Event) => {
			const target = e.target as HTMLElement;
			const { scrollTop, scrollHeight, clientHeight } = target;
			if (scrollTop + clientHeight >= scrollHeight && !loading && hasMore) {
				loadMore();
			}
		};
		const mainEl = document.querySelector('main');
		if (mainEl) {
			mainEl.addEventListener('scroll', handleScroll);
			return () => mainEl.removeEventListener('scroll', handleScroll);
		}
	}, [loadMore, loading, hasMore]);

	return (
		<>
			{!loading && firstLoaded && firstPageEmpty && (
				<EmptyState
					title="이 모임에는 아직 피드가 게시되지 않았습니다."
					description="첫 사진과 후기를 남겨보세요."
					showCreateButton={false}
				/>
			)}

			<div className="grid grid-cols-3 gap-2 p-4">
				{items.map(item => (
					<Link
						key={item.id}
						to={`/meeting/${clubId}/feed/${item.id}`}
						aria-label="피드 상세 보기"
					>
						<div className="relative aspect-square bg-gray-200 rounded overflow-hidden group">
							<img
								src={item.imageUrl}
								alt="피드 이미지"
								className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>

							{/* 하단 가독성 보정 그라데이션 */}
							<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

							{/* 좋아요/댓글 배지 */}
							<div className="absolute bottom-2 left-2 flex gap-1">
								{/* 좋아요 */}
								<div
									className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-[2px]
                             px-2 py-1 text-white shadow-sm ring-1 ring-white/10
                             group-hover:bg-black/55 group-hover:ring-white/20 transition-colors"
									aria-label={`좋아요 ${item.likeCount}개`}
								>
									<i className="ri-heart-line text-sm leading-none" />
									<span className="text-[11px] leading-none">
										{formatCount(item.likeCount)}
									</span>
								</div>

								{/* 댓글 */}
								<div
									className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-[2px]
                             px-2 py-1 text-white shadow-sm ring-1 ring-white/10
                             group-hover:bg-black/55 group-hover:ring-white/20 transition-colors"
									aria-label={`댓글 ${item.commentCount}개`}
								>
									<i className="ri-chat-3-line text-sm leading-none" />
									<span className="text-[11px] leading-none">
										{formatCount(item.commentCount)}
									</span>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>

			{loading && <p className="text-center mt-2 text-gray-500">로딩 중...</p>}
		</>
	);
};

export default MeetingFeedGrid;
