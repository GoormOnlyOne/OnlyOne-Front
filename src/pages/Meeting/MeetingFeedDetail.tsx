import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import userProfile from '../../assets/user_profile.jpg';
import apiClient from '../../api/client';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import Modal from '../../components/common/Modal';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';
import CommentSection, {
	type Comment,
} from '../../components/common/CommentSection';
import { type Meeting } from '../../components/domain/meeting/MeetingCard';
import { RefeedBottomSheet } from '../../components/common/RefeedBottomSheet';
import Loading from '../../components/common/Loading';

interface FeedDetail {
	content: string;
	imageUrls: string[];
	likeCount: number;
	commentCount: number;
	userId: number;
	nickname: string;
	profileImage: string;
	updatedAt: string;
	comments: Comment[];
	liked: boolean;
	feedMine: boolean;
}

const MeetingFeedDetail = () => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [feedData, setFeedData] = useState<FeedDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const { meetingId, feedId } = useParams();
	const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
	const [likeAnimating, setLikeAnimating] = useState(false);
	const likeSendingRef = useRef(false);
	const navigate = useNavigate();

	// 리피드 관련 상태들 추가
	const [refeedBottomSheetOpen, setRefeedBottomSheetOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			try {
				const response = await apiClient.get(
					`/clubs/${meetingId}/feeds/${feedId}`,
				);

				if (response.success) {
					const data = response.data;
					setFeedData(data);
				}
			} catch (err: unknown) {
				showApiErrorToast(err);
				console.error('데이터를 불러오는 중 오류 발생');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [meetingId, feedId]);

	const handlePrevImage = () => {
		if (!feedData) return;
		setCurrentImageIndex(prev =>
			prev > 0 ? prev - 1 : feedData.imageUrls.length - 1,
		);
	};

	const handleNextImage = () => {
		if (!feedData) return;
		setCurrentImageIndex(prev =>
			prev < feedData.imageUrls.length - 1 ? prev + 1 : 0,
		);
	};

	const handleLike = async () => {
		if (!feedData) return;
		if (likeSendingRef.current) return;
		likeSendingRef.current = true;

		const currentLiked = feedData.liked;
		const currentLikeCount = feedData.likeCount;
		setFeedData(prev => {
			if (!prev) return prev;
			const nextLiked = !prev.liked;
			return {
				...prev,
				liked: nextLiked,
				likeCount: nextLiked
					? prev.likeCount + 1
					: Math.max(0, prev.likeCount - 1),
			};
		});

		if (!currentLiked) {
			setLikeAnimating(true);
			setTimeout(() => setLikeAnimating(false), 300);
		}

		try {
			await apiClient.put(`/clubs/${meetingId}/feeds/${feedId}/likes`);
		} catch (err) {
			// API 실패 시 원래 상태로 롤백
			setFeedData(prev => {
				if (!prev) return prev;
				return {
					...prev,
					liked: currentLiked,
					likeCount: currentLikeCount,
				};
			});
			showApiErrorToast(err);
			console.error('좋아요 상태 변경 중 오류 발생');
		} finally {
			likeSendingRef.current = false;
		}
	};

	const handleFeedUpdate = () => {
		navigate(`/meeting/${meetingId}/feed/${feedId}/edit`);
	};

	const handleFeedDelete = async () => {
		try {
			const response = await apiClient.delete(
				`/clubs/${meetingId}/feeds/${feedId}`,
			);
			if (response.success) {
				globalToast('피드가 삭제되었습니다.', 'success', 2000);
				navigate(-1);
			}
		} catch (err) {
			showApiErrorToast(err);
			console.error('피드 삭제 중 오류 발생');
		} finally {
			setIsFeedModalOpen(false);
		}
	};

	// 댓글 업데이트 핸들러
	const handleCommentsUpdate = (comments: Comment[], count: number) => {
		if (!feedData) return;
		setFeedData({
			...feedData,
			comments: comments,
			commentCount: count,
		});
	};

	// 리피드 확인 핸들러
	const handleRefeedConfirm = async (selectedClub: Meeting, refeedContent: string) => {
		if (!feedId) return;

		try {
			// 리피드 API 호출
			await apiClient.post(`/feeds/${feedId}/${selectedClub.clubId}`, {
				content: refeedContent
			});

			console.log('리피드 성공!');
			globalToast('리피드가 완료되었습니다.', 'success', 2000);
			setRefeedBottomSheetOpen(false);
		} catch (error) {
			console.error('리피드 실패:', error);
			showApiErrorToast(error);
		}
	};

	// 리피드 클릭 핸들러 추가
	const handleRefeedClick = () => {
		setRefeedBottomSheetOpen(true);
	};

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center bg-white">
				<Loading text="피드를 불러오는 중..." />
			</div>
		);
	}

	if (!feedData) {
		return (
			<div className="h-full flex items-center justify-center bg-white">
				<div className="text-gray-500">피드를 불러올 수 없습니다.</div>
			</div>
		);
	}

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 피드 작성자 정보 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <img
              src={feedData.profileImage || userProfile}
              className="w-10 h-10 rounded-full"
              alt="프로필"
            />
          </div>
          <div>
            <div className="text-sm font-medium">{feedData.nickname}</div>
            <div className="text-xs text-gray-500">
              {new Date(feedData.updatedAt)
                .toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\./g, '/')
                .replace(/\/$/, '')
                .replace(/\s/g, '')}{' '}
              {new Date(feedData.updatedAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </div>
          </div>
        </div>
        {feedData.feedMine && (
          <div className="flex gap-2">
            <button
              onClick={handleFeedUpdate}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => setIsFeedModalOpen(true)}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>

			{/* 이미지 캐러셀 */}
			<div className="relative">
				<div
					className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden touch-pan-y"
					onTouchStart={e => {
						const touch = e.touches[0];
						e.currentTarget.dataset.startX = touch.clientX.toString();
					}}
					onTouchEnd={e => {
						const startX = parseFloat(e.currentTarget.dataset.startX || '0');
						const endX = e.changedTouches[0].clientX;
						const diff = startX - endX;

            if (Math.abs(diff) > 50) {
              // 50px 이상 스와이프해야 동작
              if (diff > 0) {
                handleNextImage(); // 왼쪽으로 스와이프 → 다음 이미지
              } else {
                handlePrevImage(); // 오른쪽으로 스와이프 → 이전 이미지
              }
            }
          }}
        >
          {feedData.imageUrls.length > 0 ? (
            <img
              src={feedData.imageUrls[currentImageIndex]}
              alt={`피드 이미지 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
          ) : (
            <span className="text-gray-500">사진이 들어갑니다.</span>
          )} 
        </div>

        {/* 이미지 카운터 */}
        {feedData.imageUrls.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1}/{feedData.imageUrls.length}
          </div>
        )}

        {/* 좌우 화살표 버튼 */}
        {feedData.imageUrls.length > 1 && (
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

        {/* 이미지 네비게이션 점들 */}
        {feedData.imageUrls.length > 1 && (
          <div className="flex justify-center gap-2 py-4">
            {feedData.imageUrls.map((_, index) => (
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
				<p className="text-sm">{feedData.content}</p>
			</div>

			{/* 좋아요와 댓글 정보 */}
			<div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleLike}
						aria-label="좋아요"
						aria-pressed={feedData.liked}
						className="transition-all duration-300 cursor-pointer hover:scale-110"
					>
						<i
							className={`${feedData.liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'} ${likeAnimating ? 'scale-125 animate-bounce' : ''}`}
						/>{' '}
					</button>
					<span className="text-sm font-medium">{feedData.likeCount}</span>
				</div>
				{/* 댓글 */}
				<div className="flex items-center gap-1">
					<i className="ri-chat-3-line"></i>
					<span className="text-sm">{feedData.commentCount}</span>
				</div>
				<button
					className="flex items-center gap-2"
					onClick={handleRefeedClick}
				>
					<i className="ri-repeat-2-line text-xl" />
				</button>
			</div>

			{/* CommentSection 사용 */}
			<CommentSection
				clubId={Number(meetingId)}
				feedId={Number(feedId)}
				comments={feedData.comments}
				onCommentsUpdate={handleCommentsUpdate}
				enableInfiniteScroll={false}
				showAsBottomSheet={false}
				className="pb-20"
			/>

			{/* 피드 삭제 확인 모달*/}
			<Modal
				isOpen={isFeedModalOpen}
				onClose={() => setIsFeedModalOpen(false)}
				onConfirm={handleFeedDelete}
				title="피드를 삭제하시겠습니까?"
			/>
			{/* 리피드 바텀시트 추가 */}
			<RefeedBottomSheet
				isOpen={refeedBottomSheetOpen}
				onClose={() => setRefeedBottomSheetOpen(false)}
				onConfirm={handleRefeedConfirm}
				feedId={Number(feedId)}
			/>
		</div>
	);
};

export default MeetingFeedDetail;
