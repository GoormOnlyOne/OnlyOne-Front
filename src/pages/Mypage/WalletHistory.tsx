import { useState, useEffect } from 'react';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { useNavigate } from 'react-router-dom';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import apiClient from '../../api/client';
import ListCard from '../../components/common/ListCard';
import { Wallet } from 'lucide-react'; // 충전 아이콘

interface WalletTransactionResponse {
  type: 'INCOMING' | 'OUTGOING' | 'CHARGE';
  title: string;
  amount: number;
  status: 'COMPLETED' | 'FAILED';
  mainImage: string;
  createdAt: string;
}

interface WalletTransaction {
  type: 'INCOMING' | 'OUTGOING' | 'CHARGE';
  title: string;
  amount: number;
  status: 'COMPLETED' | 'FAILED';
  main_image: string | React.ReactNode; // 아이콘도 받을 수 있도록 타입 확장
  created_at: Date;
}

interface WalletHistoryProps {
  type: 'all' | 'charge' | 'settlement';
}

const WalletHistory = ({ type }: WalletHistoryProps) => {
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getFilterParam = (
    t: WalletHistoryProps['type'],
  ): 'ALL' | 'CHARGE' | 'TRANSACTION' => {
    switch (t) {
      case 'all':
        return 'ALL';
      case 'charge':
        return 'CHARGE';
      case 'settlement':
        return 'TRANSACTION';
      default:
        return 'ALL';
    }
  };

  const withBase = (url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const BASE = import.meta?.env?.VITE_IMAGE_BASE_URL || '';
    return BASE ? `${BASE}${url}` : url;
  };

  const ChargeIcon = () => (
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
      <Wallet className="w-6 h-6 text-[var(--color-brand-primary)]" />
    </div>
  );

  const getTransactionImage = (
    transactionType: 'INCOMING' | 'OUTGOING' | 'CHARGE',
    mainImage: string,
  ) => {
    if (transactionType === 'CHARGE') {
      return <ChargeIcon />;
    }
    return withBase(mainImage);
  };

  const fetchWalletTransactions = async (
    filter: 'ALL' | 'CHARGE' | 'TRANSACTION',
  ) => {
    try {
      setLoading(true);

      const response = await apiClient.get<{
        success: boolean;
        data?: { userWalletTransactionList?: WalletTransactionResponse[] };
      }>('/users/wallet', { params: { filter } });

      const list =
        response.data?.data?.userWalletTransactionList ??
        (response as any).data?.userWalletTransactionList ??
        [];

      const transformed: WalletTransaction[] = list.map(
        ({
          type,
          title,
          amount,
          status,
          mainImage,
          createdAt,
        }: WalletTransactionResponse) => ({
          type,
          title,
          amount,
          status,
          // CHARGE는 커스텀 아이콘, 나머지는 API 응답 이미지 사용
          main_image: getTransactionImage(type, mainImage),
          created_at: new Date(createdAt),
        }),
      );
      console.log(transformed);

      setWalletTransactions(transformed);
    } catch (err: any) {
      showApiErrorToast(err);
      console.error('거래 내역 조회 실패:', err);
      navigate('/mypage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filter = getFilterParam(type);
    fetchWalletTransactions(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const getTransactionTypeText = (t: WalletTransaction['type']) => {
    switch (t) {
      case 'INCOMING':
        return '정산';
      case 'OUTGOING':
        return '차감';
      case 'CHARGE':
        return '충전';
      default:
        return '';
    }
  };

  const getTransactionTypeColor = (t: WalletTransaction['type']) => {
    const baseStyle =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-medium font-medium';
    switch (t) {
      case 'INCOMING':
        return `${baseStyle} bg-[var(--color-complement-blue)]/10 text-[var(--color-complement-blue)] ring-1 ring-[var(--color-complement-blue)]/20`;
      case 'OUTGOING':
        return `${baseStyle} bg-red-500/10 text-red-600 ring-1 ring-red-500/20`;
      case 'CHARGE':
        return `${baseStyle} bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] ring-1 ring-[var(--color-brand-primary)]/20`;
      default:
        return 'text-gray-600 bg-gray-50';
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

  const listItems = walletTransactions.map(tx => ({
    id: tx.created_at.getTime(),
    title: tx.title,
    subtitle: formatDate(tx.created_at),
    image: tx.main_image, // 문자열 URL 또는 React 컴포넌트
    badge: {
      text: getTransactionTypeText(tx.type),
      color: getTransactionTypeColor(tx.type),
    },
    rightContent: (
      <div className="font-semibold text-medium text-gray-900">
        {tx.type === 'OUTGOING' ? '-' : '+'}
        {tx.amount.toLocaleString()} P
      </div>
    ),
  }));

  return (
    <div className="bg-white min-h-screen py-4">
      <ListCard
        items={listItems}
        emptyMessage="거래 내역이 없습니다."
        loading={loading}
      />
      <ScrollToTopButton />
    </div>
  );
};

export default WalletHistory;
