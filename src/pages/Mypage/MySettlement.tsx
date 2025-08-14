import { useState, useEffect, useRef, useCallback } from 'react';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { useNavigate } from 'react-router-dom';
import {
  showApiErrorToast,
  showToast,
} from '../../components/common/Toast/ToastProvider';
import apiClient from '../../api/client';
import ListCard from '../../components/common/ListCard';
import Modal from '../../components/common/Modal';

interface MySettlementResponse {
  clubId: number;
  scheduleId: number;
  amount: number;
  mainImage: string;
  settlementStatus: 'REQUESTED' | 'COMPLETED';
  title: string; // "모임이름: 정기모임이름" 형태
  createdAt: string;
}

interface MySettlement {
  clubId: number;
  scheduleId: number;
  amount: number;
  mainImage: string;
  settlementStatus: 'REQUESTED' | 'COMPLETED';
  title: string;
  createdAt: Date;
}

const MySettlement = () => {
  const [settlements, setSettlements] = useState<MySettlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<MySettlement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  const withBase = (url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const BASE = import.meta?.env?.VITE_IMAGE_BASE_URL || '';
    return BASE ? `${BASE}${url}` : url;
  };

  // "모임이름: 정기모임이름" -> { clubName, scheduleName }
  const splitTitle = (fullTitle: string) => {
    if (!fullTitle) return { clubName: '', scheduleName: '' };
    const [club, ...rest] = fullTitle.split(':');
    return {
      clubName: (club ?? '').trim(),
      scheduleName: rest.join(':').trim(),
    };
  };

  const fetchSettlements = async (pageNum: number = 0) => {
    if (loading) return;
    try {
      setLoading(true);

      const response = await apiClient.get<{
        mySettlementList?: MySettlementResponse[];
      }>('/users/settlement', {
        params: { page: pageNum, size: 20 },
      });

      const list = response.data?.mySettlementList ?? [];
      if (list.length === 0) {
        setHasMore(false);
        return;
      }

      const transformed: MySettlement[] = list.map(
        ({
          clubId,
          scheduleId,
          amount,
          mainImage,
          settlementStatus,
          title,
          createdAt,
        }: MySettlementResponse) => ({
          clubId,
          scheduleId,
          amount,
          mainImage: withBase(mainImage),
          settlementStatus,
          title,
          createdAt: new Date(createdAt),
        }),
      );

      if (pageNum === 0) {
        setSettlements(transformed);
      } else {
        setSettlements(prev => [...prev, ...transformed]);
      }

      if (list.length < 20) {
        setHasMore(false);
      }
    } catch (err: unknown) {
      showApiErrorToast(err);
      console.error('정산 내역 조회 실패:', err);
      navigate('/mypage');
    } finally {
      setLoading(false);
    }
  };

  const lastSettlementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prevPage => prevPage + 1);
          }
        },
        { threshold: 0.1, rootMargin: '50px' },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    fetchSettlements(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > 0) {
      fetchSettlements(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getSettlementStatusText = (
    status: MySettlement['settlementStatus'],
  ) => {
    switch (status) {
      case 'REQUESTED':
        return '요청됨';
      case 'COMPLETED':
        return '완료됨';
      default:
        return '';
    }
  };

  const getSettlementStatusColor = (
    status: MySettlement['settlementStatus'],
  ) => {
    const baseStyle =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-medium font-medium';
    switch (status) {
      case 'REQUESTED':
        return `${baseStyle} bg-yellow-500/10 text-yellow-600 ring-1 ring-yellow-500/20`;
      case 'COMPLETED':
        return `${baseStyle} bg-green-500/10 text-green-600 ring-1 ring-green-500/20`;
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleModalConfirm = async () => {
    if (!selectedSettlement) return;

    try {
      await apiClient.post(
        `/clubs/${selectedSettlement.clubId}/schedules/${selectedSettlement.scheduleId}/settlements/user`,
      );

      // 정산 상태를 업데이트
      setSettlements(prev =>
        prev.map(settlement =>
          settlement.clubId === selectedSettlement.clubId &&
          settlement.scheduleId === selectedSettlement.scheduleId
            ? { ...settlement, settlementStatus: 'COMPLETED' as const }
            : settlement,
        ),
      );

      showToast('정산 완료했습니다.', 'success', 2000);
      setIsModalOpen(false);
      setSelectedSettlement(null);
    } catch (err: unknown) {
      showApiErrorToast(err);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const listItems = settlements.map(settlement => {
    const { clubName, scheduleName } = splitTitle(settlement.title);

    return {
      id: `${settlement.clubId}-${settlement.scheduleId}-${settlement.createdAt.getTime()}`,
      title: scheduleName || settlement.title, // 정기모임 이름
      subtitle: `${clubName ? `${clubName}\n` : ''}${formatDate(settlement.createdAt)}`, // 모임 이름 + 날짜
      image: settlement.mainImage,
      badge: {
        text: getSettlementStatusText(settlement.settlementStatus),
        color: getSettlementStatusColor(settlement.settlementStatus),
      },
      rightContent: (
        <div className="font-semibold text-medium text-gray-900">
          {settlement.amount.toLocaleString()} P
        </div>
      ),
      bottomContent: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {settlement.settlementStatus === 'REQUESTED' && (
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-primary text-white text-sm font-semibold px-3 py-2 shadow-sm hover:brightness-110 active:brightness-95 mt-3"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedSettlement(settlement);
                  setIsModalOpen(true);
                }}
              >
                정산하기
              </button>
            )}
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 hover:bg-gray-50 mt-3"
              onClick={e => {
                e.stopPropagation();
                navigate(`/meeting/${settlement.clubId}`);
              }}
            >
              자세히 보러가기
            </button>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen py-4">
      <ListCard
        items={listItems}
        emptyMessage="정산 내역이 없습니다."
        loading={loading && settlements.length === 0}
      />

      {hasMore && settlements.length > 0 && (
        <div
          ref={lastSettlementRef}
          className="h-1 w-full"
          style={{ visibility: 'hidden' }}
        />
      )}

      {loading && settlements.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSettlement(null);
        }}
        title="정산하시겠습니까?"
        confirmText="정산하기"
        cancelText="취소"
        onConfirm={handleModalConfirm}
      >
        <p>
          {selectedSettlement &&
            `${splitTitle(selectedSettlement.title).scheduleName} 정산을 완료하시겠습니까?`}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {selectedSettlement &&
            `정산 금액: ${selectedSettlement.amount.toLocaleString()} P`}
        </p>
      </Modal>

      <ScrollToTopButton />
    </div>
  );
};

export default MySettlement;
