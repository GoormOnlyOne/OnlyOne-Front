// src/components/domain/meeting/MeetingFeedGrid.tsx
import React, { useState, useEffect, useCallback } from 'react';

interface FeedItem {
  id: number;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
}

interface MeetingFeedGridProps {
  clubId: string;
}

const MeetingFeedGrid: React.FC<MeetingFeedGridProps> = ({ clubId }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);

    // 실제 API 호출로 다음 페이지를 가져옵니다
    fetch(`/clubs/${clubId}/feeds?page=${page}&limit=20`)
      .then(res => res.json() as Promise<FeedItem[]>)
      .then(newItems => {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      })
      .catch(err => console.error('피드 로드 실패:', err))
      .finally(() => setLoading(false));
  }, [clubId, page, loading]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= 
        document.documentElement.offsetHeight - 700
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 p-4">
        {items.map(item => (
          <div
            key={item.id}
            className="relative aspect-square bg-gray-200 rounded overflow-hidden"
          >
            <img
              src={item.imageUrl}
              alt="피드 이미지"
              className="object-cover w-full h-full"
            />
            {/* 좋아요와 댓글 개수 표시 */}
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1 flex items-center space-x-2">
              <span className="flex items-center">
                ❤️
                <span className="ml-0.5">{item.likeCount}</span>
              </span>
              <span className="flex items-center">
                💬
                <span className="ml-0.5">{item.commentCount}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center mt-2 text-gray-500">로딩 중...</p>
      )}
    </>
  );
};

export default MeetingFeedGrid;