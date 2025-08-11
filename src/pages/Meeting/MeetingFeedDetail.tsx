import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import userProfile from '../../assets/user_profile.jpg';
import apiClient from '../../api/client';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import Modal from '../../components/common/Modal';
import { showToast as globalToast } from '../../components/common/Toast/ToastProvider';
import Loading from '../../components/common/Loading'; 

interface Comment {
  commentId: number;
  userId: number;
  nickname: string;
  profileImage: string;
  content: string;
  createdAt: string;
  commentMine: boolean;
}

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
  const [newComment, setNewComment] = useState('');
  const [feedData, setFeedData] = useState<FeedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const { meetingId, feedId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const likeSendingRef = useRef(false);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!feedData) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        commentsEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    });
  }, [feedData?.comments.length]);

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

  const handleAddComment = async () => {
    if (!feedData || !newComment.trim()) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    try {
      await apiClient.post(`/clubs/${meetingId}/feeds/${feedId}/comments`, {
        content: newComment,
      });
      const response = await apiClient.get(
        `/clubs/${meetingId}/feeds/${feedId}`,
      );
      if (response.success) {
        setFeedData(response.data);
        setNewComment('');
      }
    } catch (err: unknown) {
      showApiErrorToast(err);
      console.error('데이터를 불러오는 중 오류 발생');
    } finally {
      sendingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !e.repeat) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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

  //   const newCommentData: Comment = {
  //     commentId: feedData.comments.length + 1,
  //     userId: 1, // 현재 사용자 ID
  //     nickname: '현재사용자',
  //     profileImage: 'current-user.png',
  //     content: newComment,
  //     createdAt: new Date().toISOString(),
  //     commentMine: true,
  //   };

  //   setFeedData({
  //     ...feedData,
  //     comments: [...feedData.comments, newCommentData],
  //     commentCount: feedData.commentCount + 1,
  //   });
  //   setNewComment('');
  // };

  const handleDeleteComment = async (commentId: number) => {
    if (!feedData) return;
    try {
      const response = await apiClient.delete(
        `/clubs/${meetingId}/feeds/${feedId}/comments/${commentId}`,
      );
      if (response.success) {
        setFeedData({
          ...feedData,
          comments: feedData.comments.filter(
            comment => comment.commentId !== commentId,
          ),
          commentCount: feedData.commentCount - 1,
        });
        globalToast('댓글이 삭제되었습니다.', 'success', 2000);
      }
    } catch (err: unknown) {
      showApiErrorToast(err);
      console.error('댓글 삭제 중 오류 발생');
    }
  };

  // 더 많은 댓글 불러오기
  const loadMoreComments = useCallback(async () => {
    setHasMoreComments(false);
    return;
  }, []);

  {
    /* TODO: 무한 스크롤 구현 (API 응답도 페이징으로 바꿔야 함) */
  }
  // const loadMoreComments = useCallback(async () => {
  //   if (commentsLoading || !hasMoreComments || !feedData) return;
  //   setCommentsLoading(true);
  //   try {
  //     const newComments: Comment[] = Array.from(
  //       { length: Math.min(3, 10 - (currentPage - 1) * 3) },
  //       (_, index) => {
  //         const globalIndex = (currentPage - 1) * 3 + index;
  //         return {
  //           commentId: feedData.comments.length + index + 1,
  //           userId: 8 + globalIndex,
  //           nickname: mockUserNames[globalIndex % mockUserNames.length],
  //           profileImage: `user${globalIndex + 1}.png`,
  //           content: mockComments[globalIndex % mockComments.length],
  //           createdAt: new Date(Date.now() - globalIndex * 30000).toISOString(),
  //           commentMine: Math.random() > 0.8, // 20% 확률로 내 댓글
  //         };
  //       },
  //     );

  //     // 5페이지까지만 로드 (총 15개 + 초기 8개 = 23개 댓글)
  //     if (currentPage >= 5) {
  //       setHasMoreComments(false);
  //     }

  //     setFeedData(prev =>
  //       prev
  //         ? {
  //             ...prev,
  //             comments: [...prev.comments, ...newComments],
  //           }
  //         : null,
  //     );

  //     setCurrentPage(prev => prev + 1);
  //   } catch (error) {
  //     console.error('댓글 로딩 실패:', error);
  //   } finally {
  //     setCommentsLoading(false);
  //   }
  // }, [commentsLoading, hasMoreComments, feedData, currentPage]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreComments && !commentsLoading) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreComments, hasMoreComments, commentsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen relative bg-white">
        <Loading overlay text="로딩 중..." />
      </div>
    );
  }

  if (!feedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">피드를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 피드 작성자 정보 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <img src={userProfile} className="w-10 h-10 rounded-full"></img>
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
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {currentImageIndex + 1}/{feedData.imageUrls.length}
        </div>

        {/* 좌우 화살표 버튼 */}
        {feedData.imageUrls.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 text-xl"
            >
              <i className="ri-arrow-left-wide-line"></i>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 text-xl"
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
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
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
        <div className="flex items-center gap-1">
          <i className="ri-chat-3-line"></i>
          <span className="text-sm">{feedData.commentCount}</span>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="flex-1 pb-28">
        {feedData.comments.map(comment => (
          <div
            key={comment.commentId}
            className="flex items-start gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100 m-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <img
                src={comment.profileImage}
                className="w-8 h-8 rounded-full"
              ></img>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.nickname}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt)
                    .toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replace(/\./g, '/')
                    .replace(/\/$/, '')
                    .replace(/\s/g, '')}{' '}
                  {new Date(comment.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
                {comment.commentMine && (
                  <button
                    onClick={() => {
                      setDeleteTargetId(comment.commentId);
                      setIsModalOpen(true);
                    }}
                    className="ml-auto px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}

        {/* 무한 스크롤 트리거 */}
        <div ref={observerRef} className="h-4" />

        {/* 댓글 로딩 상태 */}
        {commentsLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              댓글을 불러오는 중...
            </div>
          </div>
        )}
        <div ref={commentsEndRef} className="h-24" />
      </div>

      {/* 댓글 입력 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
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
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium"
          >
            전송
          </button>
        </div>
      </div>

      {/* 댓글 삭제 확인 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={async () => {
          if (deleteTargetId == null) return;
          await handleDeleteComment(deleteTargetId);
          setIsModalOpen(false);
          setDeleteTargetId(null);
        }}
        title="댓글을 삭제하시겠습니까?"
      />

      {/* 피드 삭제 확인 모달*/}
      <Modal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onConfirm={handleFeedDelete}
        title="피드를 삭제하시겠습니까?"
      />
    </div>
  );
};

export default MeetingFeedDetail;
