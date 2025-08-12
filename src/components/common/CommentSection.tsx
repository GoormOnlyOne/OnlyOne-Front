import { useState, useRef, useEffect, useCallback } from 'react';
import userProfile from '../../assets/user_profile.jpg';
import apiClient from '../../api/client';
import Modal from '../common/Modal';
import { showToast } from '../../components/common/Toast/ToastProvider';

export interface Comment {
	commentId: number;
	userId: number;
	nickname: string;
	profileImage: string;
	content: string;
	createdAt: string;
	commentMine: boolean;
}

interface CommentSectionProps {
	// API 관련
	clubId: number;
	feedId: number;
	comments: Comment[];
	onCommentsUpdate: (comments: Comment[], count: number) => void;

	// UI 관련
	enableInfiniteScroll?: boolean;
	showAsBottomSheet?: boolean;
	maxHeight?: string;
	className?: string;
}

export const CommentSection = ({
	clubId,
	feedId,
	comments,
	onCommentsUpdate,
	enableInfiniteScroll = false,
	showAsBottomSheet = false,
	maxHeight,
	className = '',
}: CommentSectionProps) => {
	const [newComment, setNewComment] = useState('');
	const [commentSubmitting, setCommentSubmitting] = useState(false);
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [commentsPage, setCommentsPage] = useState(0);
	const [commentsHasMore, setCommentsHasMore] = useState(true);

	const observerRef = useRef<HTMLDivElement>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

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

	// 댓글 추가
	const handleAddComment = async () => {
		if (!newComment.trim() || commentSubmitting) return;

		const commentContent = newComment.trim();
		setCommentSubmitting(true);

		try {
			// 댓글 추가 API 호출
			await apiClient.post(`/clubs/${clubId}/feeds/${feedId}/comments`, {
				content: commentContent,
			});

			// 성공 시에만 입력창 비우기
			setNewComment('');

			// 댓글 목록 새로고침
			if (enableInfiniteScroll) {
				const response = await apiClient.get(
					`/feeds/${feedId}/comments?page=0&limit=20`,
				);
				const newComments =
					response.data?.content || response.data?.data || response.data || [];
				onCommentsUpdate(newComments, newComments.length);
				setCommentsPage(0);
				setCommentsHasMore(newComments.length >= 20);
			} else {
				// MeetingFeedDetail 방식: 전체 피드 정보 다시 불러오기
				const response = await apiClient.get(
					`/clubs/${clubId}/feeds/${feedId}`,
				);
				if (response.success) {
					onCommentsUpdate(response.data.comments, response.data.commentCount);
				}
			}
		} catch (error) {
			console.error('댓글 추가 실패:', error);
			showToast('댓글 추가에 실패했습니다. 다시 시도해주세요.', 'error');
		} finally {
			setCommentSubmitting(false);
		}
	};

	// 댓글 삭제
	const handleDeleteClick = (commentId: number) => {
		setDeleteTargetId(commentId);
		setIsDeleteModalOpen(true);
	}

	const handleDeleteConfirm = async () => {
		if (!deleteTargetId) return;

		try {
			await apiClient.delete(
				`/clubs/${clubId}/feeds/${feedId}/comments/${deleteTargetId}`,
			);

			// 댓글 목록에서 삭제
			const updatedComments = comments.filter(
				comment => comment.commentId !== deleteTargetId,
			);
			onCommentsUpdate(updatedComments, updatedComments.length);

			// 모달 닫기
			setIsDeleteModalOpen(false);
			setDeleteTargetId(null);
		} catch (error) {
			console.error('댓글 삭제 실패:', error);
			showToast('댓글 삭제에 실패했습니다.', 'error');
		}
	};

	const handleModalClose = () => {
		setIsDeleteModalOpen(false);
		setDeleteTargetId(null);
	};

	// 무한 스크롤 - 더 많은 댓글 로드
	const loadMoreComments = useCallback(async () => {
		if (!enableInfiniteScroll || commentsLoading || !commentsHasMore) return;

		try {
			setCommentsLoading(true);
			const nextPage = commentsPage + 1;
			const response = await apiClient.get(
				`/feeds/${feedId}/comments?page=${nextPage}&limit=20`,
			);
			const newComments =
				response.data?.content || response.data?.data || response.data || [];

			const updatedComments = [...comments, ...newComments];
			onCommentsUpdate(updatedComments, updatedComments.length);
			setCommentsPage(nextPage);
			setCommentsHasMore(newComments.length >= 20);
		} catch (error) {
			console.error('댓글 추가 로드 실패:', error);
			setCommentsHasMore(false);
		} finally {
			setCommentsLoading(false);
		}
	}, [
		enableInfiniteScroll,
		commentsLoading,
		commentsHasMore,
		commentsPage,
		comments,
		feedId,
		onCommentsUpdate,
	]);

	// Intersection Observer 설정 (무한 스크롤용)
	useEffect(() => {
		if (!enableInfiniteScroll) return;

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && commentsHasMore && !commentsLoading) {
					loadMoreComments();
				}
			},
			{ threshold: 0.1 },
		);

		if (observerRef.current) {
			observer.observe(observerRef.current);
		}

		return () => observer.disconnect();
	}, [
		enableInfiniteScroll,
		loadMoreComments,
		commentsHasMore,
		commentsLoading,
	]);

	// Enter 키 핸들러
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !commentSubmitting) {
			e.preventDefault();
			handleAddComment();
		}
	};

	const containerStyle = maxHeight ? { maxHeight } : {};

	return (
		<div className={`flex flex-col h-full ${className}`} style={containerStyle}>
			{/* 댓글 목록 */}
			<div
				className={`flex-1 overflow-y-auto ${showAsBottomSheet ? 'px-4 pb-4' : 'pb-28'}`}
				onScroll={
					enableInfiniteScroll && showAsBottomSheet
						? e => {
							const target = e.target as HTMLElement;
							const { scrollTop, scrollHeight, clientHeight } = target;
							// 스크롤이 바닥에서 100px 이내에 도달하면 더 로드
							if (
								scrollTop + clientHeight >= scrollHeight - 100 &&
								!commentsLoading &&
								commentsHasMore
							) {
								loadMoreComments();
							}
						}
						: undefined
				}
			>
				{comments && comments.length > 0 ? (
					<>
						{comments
							.filter(comment => comment && comment.commentId)
							.map(comment => (
								<div
									key={comment.commentId}
									className={`flex items-start gap-3 py-3 ${showAsBottomSheet
										? 'bg-white rounded-lg border border-gray-100 mx-4 mb-3 px-3 hover:shadow-sm transition-shadow'
										: 'bg-white rounded-lg border border-gray-100 m-4 px-4 hover:shadow-sm transition-shadow'
										}`}
								>
									<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
										<img
											src={comment?.profileImage || userProfile}
											className="w-8 h-8 rounded-full"
											alt="프로필"
											onError={e => {
												e.currentTarget.src = userProfile;
											}}
										/>
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-sm font-medium">
												{comment?.nickname || '익명'}
											</span>
											<span className="text-xs text-gray-500">
												{comment?.createdAt
													? formatDate(comment.createdAt)
													: ''}
											</span>
											{comment.commentMine && (
												<button
													onClick={() => handleDeleteClick(comment.commentId)}
													className="ml-auto px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
												>
													삭제
												</button>
											)}
										</div>
										<p className="text-sm text-gray-700">
											{comment?.content || ''}
										</p>
									</div>
								</div>
							))}

						{/* 무한 스크롤 트리거 */}
						{enableInfiniteScroll && <div ref={observerRef} className="h-4" />}

						{/* 로딩 인디케이터 */}
						{commentsLoading && (
							<div className="flex justify-center py-4">
								<div className="text-gray-500 text-sm">
									댓글을 불러오는 중...
								</div>
							</div>
						)}
					</>
				) : (
					<div className="flex items-center justify-center py-8">
						<div className="text-gray-500">첫 번째 댓글을 남겨보세요!</div>
					</div>
				)}
			</div>

			{/* 댓글 입력 */}
			<div
				className={`bg-white border-t border-gray-200 p-4 ${showAsBottomSheet ? 'sticky bottom-0' : 'fixed bottom-0 left-0 right-0'}`}
			>
				<div className="flex items-center gap-3">
					<input
						type="text"
						value={newComment}
						onChange={e => setNewComment(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="댓글을 입력해주세요."
						className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
					/>
					<button
						onClick={handleAddComment}
						disabled={commentSubmitting}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${commentSubmitting
							? 'bg-gray-400 text-gray-200 cursor-not-allowed'
							: 'bg-brand-primary text-white hover:bg-brand-secondary'
							}`}
					>
						{commentSubmitting ? '전송중...' : '전송'}
					</button>
				</div>
			</div>
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={handleModalClose}
				onConfirm={handleDeleteConfirm}
				title="댓글을 삭제하시겠습니까?"
				variant="default"
				confirmText="삭제"
			/>
		</div>
	);
};

export default CommentSection;
