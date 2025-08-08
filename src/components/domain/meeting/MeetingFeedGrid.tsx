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

const MeetingFeedGrid: React.FC<MeetingFeedGridProps> = ({ clubId }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [firstPageEmpty, setFirstPageEmpty] = useState(false); 

  

  // 즉시 반영되는 로딩 상태
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    apiClient
      .get<CommonResponse<PageResponse<FeedSummaryDto>>>(
        `/clubs/${clubId}/feeds?page=${page}&limit=20`
      )
      .then(response => {
        const content = response.data.content;

        // ✅ 첫 페이지 응답 처리
        if (page === 0) {
          setFirstLoaded(true);
          setFirstPageEmpty(content.length === 0);
        }

        // 마지막 페이지인지 확인
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
        setLoading(false)}
      );
  }, [clubId, page, hasMore]);

  useEffect(() => {
    loadMore();
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
          <Link key={item.id} to={`/meeting/${clubId}/feed/${item.id}`}>
            <div className="relative aspect-square bg-gray-200 rounded overflow-hidden">
              <img
                src={item.imageUrl}
                alt="피드 이미지"
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1 flex items-center space-x-2">
                <span className="flex items-center">❤️<span className="ml-0.5">{item.likeCount}</span></span>
                <span className="flex items-center">💬<span className="ml-0.5">{item.commentCount}</span></span>
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