import { useState, useEffect, useCallback, useRef } from 'react';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { BottomSheet } from '../../components/common/BottomSheet';
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

interface FeedData {
  feedId: number;
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
  isRepost?: boolean;
  originalFeed?: FeedData;
  repostComment?: string;
}

interface FeedItemProps {
  feed: FeedData;
  onCommentClick: (feedId: number) => void;
}

// 가장 원본 피드를 찾는 함수 (플래튼)
const findOriginalFeed = (feed: FeedData): FeedData => {
  if (!feed.originalFeed || !feed.originalFeed.isRepost) {
    return feed.originalFeed || feed;
  }
  return findOriginalFeed(feed.originalFeed);
};

// 리피드 체인 생성 함수 (A → B → C 형태로)
const getRepostChain = (feed: FeedData): string[] => {
  const chain: string[] = [];
  let currentFeed: FeedData | undefined = feed;
  
  while (currentFeed && currentFeed.isRepost && currentFeed.originalFeed) {
    chain.push(currentFeed.nickname);
    currentFeed = currentFeed.originalFeed;
  }
  
  if (currentFeed) {
    chain.push(currentFeed.nickname); // 마지막 원본 작성자
  }
  
  return chain;
};

const FeedItem = ({ feed, onCommentClick }: FeedItemProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [originalFeedImageIndex, setOriginalFeedImageIndex] = useState(0);
  
  // 플래튼된 원본 피드와 리피드 체인 가져오기
  const actualOriginalFeed = feed.isRepost ? findOriginalFeed(feed) : null;
  const repostChain = feed.isRepost ? getRepostChain(feed) : [];

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

  const handlePrevOriginalImage = () => {
    if (!actualOriginalFeed) return;
    setOriginalFeedImageIndex(prev =>
      prev > 0 ? prev - 1 : actualOriginalFeed.imageUrls.length - 1,
    );
  };

  const handleNextOriginalImage = () => {
    if (!actualOriginalFeed) return;
    setOriginalFeedImageIndex(prev =>
      prev < actualOriginalFeed.imageUrls.length - 1 ? prev + 1 : 0,
    );
  };

  return (
    <div className="bg-white mb-4 shadow-sm">
      {/* 피드 작성자 정보 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <img src={userProfile} className="w-10 h-10 rounded-full" alt="프로필" />
          </div>
          <div>
            <div className="text-sm font-medium">{feed.nickname}</div>
            <div className="text-xs text-gray-500">
              {new Date(feed.updatedAt)
                .toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\./g, '/')
                .replace(/\/$/, '')
                .replace(/\s/g, '')}{' '}
              {new Date(feed.updatedAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </div>
          </div>
        </div>
        {feed.feedMine && (
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
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <span className="text-gray-500">사진이 들어갑니다.</span>
            )}
          </div>
        )}

        {/* 리피드: 플래튼된 원본 피드 표시 */}
        {feed.isRepost && actualOriginalFeed && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* 원본 작성자 정보 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <img src={userProfile} className="w-8 h-8 rounded-full" alt="프로필" />
                </div>
                <div>
                  <div className="text-sm font-medium">{actualOriginalFeed.nickname}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(actualOriginalFeed.updatedAt)
                      .toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                      })
                      .replace(/\./g, '/')
                      .replace(/\/$/, '')
                      .replace(/\s/g, '')}{' '}
                    {new Date(actualOriginalFeed.updatedAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 원본 이미지 */}
            <div className="relative">
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
                      handleNextOriginalImage();
                    } else {
                      handlePrevOriginalImage();
                    }
                  }
                }}
              >
                {actualOriginalFeed.imageUrls.length > 0 ? (
                  <img
                    src={actualOriginalFeed.imageUrls[originalFeedImageIndex]}
                    alt={`원본 피드 이미지 ${originalFeedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                ) : (
                  <span className="text-gray-500">사진이 들어갑니다.</span>
                )}
              </div>

              {/* 원본 이미지 카운터 */}
              {actualOriginalFeed.imageUrls.length > 1 && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {originalFeedImageIndex + 1}/{actualOriginalFeed.imageUrls.length}
                </div>
              )}

              {/* 원본 이미지 좌우 화살표 버튼 */}
              {actualOriginalFeed.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevOriginalImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                  >
                    <i className="ri-arrow-left-wide-line"></i>
                  </button>
                  <button
                    onClick={handleNextOriginalImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                  >
                    <i className="ri-arrow-right-wide-line"></i>
                  </button>
                </>
              )}

              {/* 원본 이미지 네비게이션 점들 */}
              {actualOriginalFeed.imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {actualOriginalFeed.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setOriginalFeedImageIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === originalFeedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 원본 내용 */}
            <div className="px-4 py-3">
              <p className="text-sm">{actualOriginalFeed.content}</p>
            </div>

            {/* 원본 상호작용 수치 */}
            <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <i className="ri-heart-line text-xl" />
                <span className="text-sm">{actualOriginalFeed.likeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-chat-3-line text-xl" />
                <span className="text-sm">{actualOriginalFeed.commentCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* 일반 피드 - 이미지 카운터 */}
        {!feed.isRepost && feed.imageUrls.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1}/{feed.imageUrls.length}
          </div>
        )}

        {/* 일반 피드 - 좌우 화살표 버튼 */}
        {!feed.isRepost && feed.imageUrls.length > 1 && (
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

        {/* 일반 피드 - 이미지 네비게이션 점들 */}
        {!feed.isRepost && feed.imageUrls.length > 1 && (
          <div className="flex justify-center gap-2 py-4">
            {feed.imageUrls.map((_, index) => (
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
        {/* 리피드 표시 - 직접 리피드한 대상 */}
        {feed.isRepost && feed.originalFeed && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <i className="ri-repeat-line"></i>
            <span>
              {feed.nickname}님이 {feed.originalFeed.nickname}님의 {feed.originalFeed.isRepost ? '리피드를' : '피드를'} 리피드함
            </span>
          </div>
        )}
        <p className="text-sm">{feed.content}</p>
      </div>

      {/* 좋아요와 댓글 버튼 */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
        <button className="flex items-center gap-2">
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
      </div>
    </div>
  );
};

export const FeedList = () => {
  const [feeds, setFeeds] = useState<FeedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBottomSheetOpen, setCommentBottomSheetOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedData | null>(null);
  const [newComment, setNewComment] = useState('');

  // API 호출 시뮬레이션 (실제로는 useEffect에서 API 호출)
  useEffect(() => {
    // 임시 데이터 - 실제로는 client.ts의 API 호출로 대체
    const mockFeeds: FeedData[] = [
      {
        feedId: 1,
        content: '오늘 정말 즐거운 모임이었어요! 다들 너무 재미있게 보내신 것 같아서 기뻐요 😊',
        imageUrls: [
          'https://d1c3fg3ti7m8cn.cloudfront.net/user/2e18a659-cd67-4f5e-b12a-65c6f34a2541',
          'https://d1c3fg3ti7m8cn.cloudfront.net/user/6cb9a365-3352-443f-b208-6f7c538d0d41',
        ],
        likeCount: 15,
        commentCount: 8,
        userId: 1,
        nickname: 'Alice',
        profileImage: 'alice.png',
        updatedAt: '2025-07-31T17:07:13.287214',
        comments: [
          {
            commentId: 1,
            userId: 2,
            nickname: 'Bob',
            profileImage: 'bob.png',
            content: '정말 좋은 시간이었어요!',
            createdAt: '2025-08-01T12:43:04.775105',
            commentMine: false,
          },
        ],
        liked: true,
        feedMine: true,
      },
      {
        feedId: 2,
        content: '새로운 카페에서 모임을 가졌는데 분위기가 정말 좋네요. 다음에도 여기서 만나면 좋을 것 같아요!',
        imageUrls: [
          'https://d1c3fg3ti7m8cn.cloudfront.net/user/c29188ec-a9ca-4562-a959-8574b2703b0c',
        ],
        likeCount: 12,
        commentCount: 5,
        userId: 2,
        nickname: 'Bob',
        profileImage: 'bob.png',
        updatedAt: '2025-07-30T15:30:00.000000',
        comments: [
          {
            commentId: 2,
            userId: 1,
            nickname: 'Alice',
            profileImage: 'alice.png',
            content: '카페 분위기 정말 좋았어요!',
            createdAt: '2025-07-30T16:00:00.000000',
            commentMine: true,
          },
        ],
        liked: false,
        feedMine: false,
      },
      {
        feedId: 3,
        content: '이 피드 너무 공감되네요! 저도 비슷한 경험이 있어서 공유하고 싶어요.',
        imageUrls: [],
        likeCount: 8,
        commentCount: 3,
        userId: 3,
        nickname: 'Charlie',
        profileImage: 'charlie.png',
        updatedAt: '2025-07-29T14:20:00.000000',
        comments: [
          {
            commentId: 3,
            userId: 1,
            nickname: 'Alice',
            profileImage: 'alice.png',
            content: '공유해주셔서 감사해요!',
            createdAt: '2025-07-29T15:00:00.000000',
            commentMine: true,
          },
        ],
        liked: true,
        feedMine: false,
        isRepost: true,
        originalFeed: {
          feedId: 1,
          content: '오늘 정말 즐거운 모임이었어요! 다들 너무 재미있게 보내신 것 같아서 기뻐요 😊',
          imageUrls: [
            'https://d1c3fg3ti7m8cn.cloudfront.net/user/2e18a659-cd67-4f5e-b12a-65c6f34a2541',
            'https://d1c3fg3ti7m8cn.cloudfront.net/user/6cb9a365-3352-443f-b208-6f7c538d0d41',
            'https://d1c3fg3ti7m8cn.cloudfront.net/user/c29188ec-a9ca-4562-a959-8574b2703b0c',
          ],
          likeCount: 15,
          commentCount: 8,
          userId: 1,
          nickname: 'Alice',
          profileImage: 'alice.png',
          updatedAt: '2025-07-31T17:07:13.287214',
          comments: [],
          liked: true,
          feedMine: true,
        },
      },
      {
        feedId: 4,
        content: '이런 모임들이 더 많이 생겨야 할 것 같아요! 정말 의미있는 시간이었네요.',
        imageUrls: [],
        likeCount: 6,
        commentCount: 2,
        userId: 4,
        nickname: 'Diana',
        profileImage: 'diana.png',
        updatedAt: '2025-07-28T16:45:00.000000',
        comments: [
          {
            commentId: 4,
            userId: 2,
            nickname: 'Bob',
            profileImage: 'bob.png',
            content: '동감합니다!',
            createdAt: '2025-07-28T17:00:00.000000',
            commentMine: false,
          },
        ],
        liked: false,
        feedMine: false,
        isRepost: true,
        originalFeed: {
          feedId: 2,
          content: '새로운 카페에서 모임을 가졌는데 분위기가 정말 좋네요. 다음에도 여기서 만나면 좋을 것 같아요!',
          imageUrls: [
            'https://d1c3fg3ti7m8cn.cloudfront.net/user/c29188ec-a9ca-4562-a959-8574b2703b0c',
          ],
          likeCount: 12,
          commentCount: 5,
          userId: 2,
          nickname: 'Bob',
          profileImage: 'bob.png',
          updatedAt: '2025-07-30T15:30:00.000000',
          comments: [],
          liked: false,
          feedMine: false,
        },
      },
      {
        feedId: 5,
        content: '이런 좋은 모임 정보를 더 많은 분들이 봤으면 좋겠어요! 공유합니다.',
        imageUrls: [],
        likeCount: 4,
        commentCount: 1,
        userId: 5,
        nickname: 'Eve',
        profileImage: 'eve.png',
        updatedAt: '2025-07-27T13:15:00.000000',
        comments: [
          {
            commentId: 5,
            userId: 3,
            nickname: 'Charlie',
            profileImage: 'charlie.png',
            content: '정말 좋은 정보네요!',
            createdAt: '2025-07-27T14:00:00.000000',
            commentMine: false,
          },
        ],
        liked: false,
        feedMine: false,
        isRepost: true,
        originalFeed: {
          feedId: 3,
          content: '이 피드 너무 공감되네요! 저도 비슷한 경험이 있어서 공유하고 싶어요.',
          imageUrls: [],
          likeCount: 8,
          commentCount: 3,
          userId: 3,
          nickname: 'Charlie',
          profileImage: 'charlie.png',
          updatedAt: '2025-07-29T14:20:00.000000',
          comments: [],
          liked: true,
          feedMine: false,
          isRepost: true,
          originalFeed: {
            feedId: 1,
            content: '오늘 정말 즐거운 모임이었어요! 다들 너무 재미있게 보내신 것 같아서 기뻐요 😊',
            imageUrls: [
              'https://d1c3fg3ti7m8cn.cloudfront.net/user/2e18a659-cd67-4f5e-b12a-65c6f34a2541',
              'https://d1c3fg3ti7m8cn.cloudfront.net/user/6cb9a365-3352-443f-b208-6f7c538d0d41',
              'https://d1c3fg3ti7m8cn.cloudfront.net/user/c29188ec-a9ca-4562-a959-8574b2703b0c',
            ],
            likeCount: 15,
            commentCount: 8,
            userId: 1,
            nickname: 'Alice',
            profileImage: 'alice.png',
            updatedAt: '2025-07-31T17:07:13.287214',
            comments: [],
            liked: true,
            feedMine: true,
          },
        },
      },
    ];

    // 로딩 시뮬레이션
    setTimeout(() => {
      setFeeds(mockFeeds);
      setLoading(false);
    }, 500);
  }, []);

  const handleCommentClick = (feedId: number) => {
    const feed = feeds.find(f => f.feedId === feedId);
    if (feed) {
      setSelectedFeed(feed);
      setCommentBottomSheetOpen(true);
    }
  };

  const handleAddComment = () => {
    if (!selectedFeed || !newComment.trim()) return;

    const newCommentData: Comment = {
      commentId: selectedFeed.comments.length + 1,
      userId: 1, // 현재 사용자 ID
      nickname: '현재사용자',
      profileImage: 'current-user.png',
      content: newComment,
      createdAt: new Date().toISOString(),
      commentMine: true,
    };

    const updatedFeed = {
      ...selectedFeed,
      comments: [...selectedFeed.comments, newCommentData],
      commentCount: selectedFeed.commentCount + 1,
    };

    setSelectedFeed(updatedFeed);
    setFeeds(prev => prev.map(feed => 
      feed.feedId === selectedFeed.feedId ? updatedFeed : feed
    ));
    setNewComment('');
  };

  const handleDeleteComment = (commentId: number) => {
    if (!selectedFeed) return;

    const updatedFeed = {
      ...selectedFeed,
      comments: selectedFeed.comments.filter(
        comment => comment.commentId !== commentId,
      ),
      commentCount: selectedFeed.commentCount - 1,
    };

    setSelectedFeed(updatedFeed);
    setFeeds(prev => prev.map(feed => 
      feed.feedId === selectedFeed.feedId ? updatedFeed : feed
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">피드를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 피드 리스트 */}
      <div className="pb-4">
        {feeds.map(feed => (
          <FeedItem
            key={feed.feedId}
            feed={feed}
            onCommentClick={handleCommentClick}
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
      >
        {selectedFeed && (
          <div className="flex flex-col h-full">
            {/* 댓글 목록 */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {selectedFeed.comments.map(comment => (
                <div
                  key={comment.commentId}
                  className="flex items-start gap-3 py-3"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <img src={userProfile} className="w-8 h-8 rounded-full" alt="프로필" />
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
            </div>

            {/* 댓글 입력 */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default FeedList;
