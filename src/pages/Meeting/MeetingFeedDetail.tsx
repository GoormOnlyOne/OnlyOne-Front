import { useState, useEffect, useRef, useCallback } from 'react';
import userProfile from '../../assets/user_profile.jpg';

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
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  // API 호출 시뮬레이션 (실제로는 useEffect에서 API 호출)
  useEffect(() => {
    // 임시 데이터 - 실제로는 client.ts의 API 호출로 대체
    const mockFeedData: FeedDetail = {
      content: '여기는 피드 내용이 들어갈 예정입니다.',
      imageUrls: [
        'https://d1c3fg3ti7m8cn.cloudfront.net/user/2e18a659-cd67-4f5e-b12a-65c6f34a2541',
        'https://d1c3fg3ti7m8cn.cloudfront.net/user/6cb9a365-3352-443f-b208-6f7c538d0d41',
        'https://d1c3fg3ti7m8cn.cloudfront.net/user/c29188ec-a9ca-4562-a959-8574b2703b0c',
      ],
      likeCount: 13,
      commentCount: 12,
      userId: 1,
      nickname: 'Alice',
      profileImage: 'alice.png',
      updatedAt: '2025-07-31T17:07:13.287214',
      comments: [
        {
          commentId: 1,
          userId: 1,
          nickname: 'Alice',
          profileImage: 'alice.png',
          content: '정말 좋은 사진이네요!',
          createdAt: '2025-08-01T12:43:04.775105',
          commentMine: true,
        },
        {
          commentId: 2,
          userId: 2,
          nickname: 'Bob',
          profileImage: 'bob.png',
          content: '여기 어디인가요?',
          createdAt: '2025-08-01T12:43:12.958482',
          commentMine: false,
        },
        {
          commentId: 3,
          userId: 3,
          nickname: 'Charlie',
          profileImage: 'charlie.png',
          content: '너무 맛있어 보여요!',
          createdAt: '2025-08-01T12:44:15.123456',
          commentMine: false,
        },
        {
          commentId: 4,
          userId: 4,
          nickname: 'Diana',
          profileImage: 'diana.png',
          content: '다음에 저도 같이 가고 싶어요~',
          createdAt: '2025-08-01T12:45:30.789012',
          commentMine: false,
        },
        {
          commentId: 5,
          userId: 1,
          nickname: 'Alice',
          profileImage: 'alice.png',
          content: '감사합니다! 다음에 꼭 함께 가요 😊',
          createdAt: '2025-08-01T12:46:45.345678',
          commentMine: true,
        },
        {
          commentId: 6,
          userId: 5,
          nickname: 'Eve',
          profileImage: 'eve.png',
          content: '분위기가 정말 좋네요!',
          createdAt: '2025-08-01T12:47:20.456789',
          commentMine: false,
        },
        {
          commentId: 7,
          userId: 6,
          nickname: 'Frank',
          profileImage: 'frank.png',
          content: '사진 정말 잘 찍으셨어요 👍',
          createdAt: '2025-08-01T12:48:35.567890',
          commentMine: false,
        },
        {
          commentId: 8,
          userId: 7,
          nickname: 'Grace',
          profileImage: 'grace.png',
          content: '저도 이런 곳 가보고 싶어요!',
          createdAt: '2025-08-01T12:49:50.678901',
          commentMine: false,
        },
      ],
      liked: true,
      feedMine: true,
    };

    // 로딩 시뮬레이션
    setTimeout(() => {
      setFeedData(mockFeedData);
      setLoading(false);
    }, 500);
  }, []);

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

  const handleAddComment = () => {
    if (!feedData || !newComment.trim()) return;

    const newCommentData: Comment = {
      commentId: feedData.comments.length + 1,
      userId: 1, // 현재 사용자 ID
      nickname: '현재사용자',
      profileImage: 'current-user.png',
      content: newComment,
      createdAt: new Date().toISOString(),
      commentMine: true,
    };

    setFeedData({
      ...feedData,
      comments: [...feedData.comments, newCommentData],
      commentCount: feedData.commentCount + 1,
    });
    setNewComment('');
  };

  const handleDeleteComment = (commentId: number) => {
    if (!feedData) return;

    setFeedData({
      ...feedData,
      comments: feedData.comments.filter(
        comment => comment.commentId !== commentId,
      ),
      commentCount: feedData.commentCount - 1,
    });
  };

  // 더 많은 댓글 불러오기
  const loadMoreComments = useCallback(async () => {
    if (commentsLoading || !hasMoreComments || !feedData) return;

    setCommentsLoading(true);
    try {
      // 임시 데이터 - 실제로는 API 호출
      const mockUserNames = [
        'Henry',
        'Ivy',
        'Jack',
        'Kate',
        'Leo',
        'Mia',
        'Noah',
        'Olivia',
        'Paul',
        'Quinn',
      ];
      const mockComments = [
        '정말 재미있어 보이네요!',
        '저도 참여하고 싶어요',
        '분위기가 너무 좋아요 ✨',
        '다음 모임은 언제인가요?',
        '사진 너무 예뻐요!',
        '여기 분위기 어떤가요?',
        '즐거운 시간 보내세요~',
        '저도 초대해주세요 😄',
        '정말 맛있어 보여요',
        '좋은 추억 만드시길!',
      ];

      const newComments: Comment[] = Array.from(
        { length: Math.min(3, 10 - (currentPage - 1) * 3) },
        (_, index) => {
          const globalIndex = (currentPage - 1) * 3 + index;
          return {
            commentId: feedData.comments.length + index + 1,
            userId: 8 + globalIndex,
            nickname: mockUserNames[globalIndex % mockUserNames.length],
            profileImage: `user${globalIndex + 1}.png`,
            content: mockComments[globalIndex % mockComments.length],
            createdAt: new Date(Date.now() - globalIndex * 30000).toISOString(),
            commentMine: Math.random() > 0.8, // 20% 확률로 내 댓글
          };
        },
      );

      // 5페이지까지만 로드 (총 15개 + 초기 8개 = 23개 댓글)
      if (currentPage >= 5) {
        setHasMoreComments(false);
      }

      setFeedData(prev =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, ...newComments],
            }
          : null,
      );

      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [commentsLoading, hasMoreComments, feedData, currentPage]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
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
            <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors">
              수정
            </button>
            <button className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
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
          <i
            className={`${feedData.liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'}`}
          ></i>
          <span className="text-sm">{feedData.likeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-chat-3-line"></i>
          <span className="text-sm">{feedData.commentCount}</span>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="flex-1 pb-20">
        {feedData.comments.map(comment => (
          <div
            key={comment.commentId}
            className="flex items-start gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100 m-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <img src={userProfile} className="w-8 h-8 rounded-full"></img>
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
                    onClick={() => handleDeleteComment(comment.commentId)}
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
      </div>

      {/* 댓글 입력 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
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
    </div>
  );
};

export default MeetingFeedDetail;
