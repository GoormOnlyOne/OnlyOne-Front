// src/components/domain/meeting/MeetingFeedGrid.tsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api/client';
import { Link } from 'react-router-dom';

// 화면에서 사용하는 피드 아이템 타입
interface FeedItem {
  id: number;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
}

// 백엔드에서 내려주는 DTO 스펙
interface FeedSummaryDto {
  feedId: number;
  thumbnailUrl: string;
  likeCount: number;
  commentCount: number;
}

// 페이징된 응답 구조
interface PageResponse<T> {
  content: T[];
  // 기타 메타데이터 생략
}

// 공통 응답 래퍼
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

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    apiClient
      .get<CommonResponse<PageResponse<FeedSummaryDto>>>(
        `/clubs/${clubId}/feeds?page=${page}&limit=20`
      )
      .then(response => {
        const content = response.data.data.content;
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
      .finally(() => setLoading(false));
  }, [clubId, page, loading, hasMore]);

  // 최초 한 번 데이터 로드
  useEffect(() => {
    loadMore();
  }, []);

  // 무한 스크롤 핸들러 (main 요소 내부)
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