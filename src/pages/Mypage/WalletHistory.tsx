import { useState, useEffect } from 'react';
import clsx from 'clsx';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import { useNavigate } from 'react-router-dom';
import { showApiErrorToast } from '../../components/common/Toast/ToastProvider';
import apiClient from '../../api/client';
import Loading from '../../components/common/Loading';

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
  main_image: string;
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

  const getFilterParam = (type: string): 'ALL' | 'CHARGE' | 'TRANSACTION' => {
    switch (type) {
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

  const fetchWalletTransactions = async (filter: string) => {
    try {
      setLoading(true);

      const response = await apiClient.get<{
        success: boolean;
        data: { userWalletTransactionList?: WalletTransactionResponse[] };
      }>('/users/wallet', { params: { filter } });

      const list = response.data.userWalletTransactionList ?? [];

      // API 응답을 컴포넌트에서 사용하는 형태로 변환
      const transformed: WalletTransaction[] = list.map(
        ({ type, title, amount, status, mainImage, createdAt }) => ({
          type,
          title,
          amount,
          status,
          main_image: mainImage,
          created_at: new Date(createdAt),
        }),
      );

      // ③ 상태 업데이트
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
  }, [type]);

  const getTransactionTypeText = (type: string) => {
    switch (type) {
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

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'INCOMING':
        return 'text-green-600 bg-green-50';
      case 'OUTGOING':
        return 'text-red-600 bg-red-50';
      case 'CHARGE':
        return 'text-blue-600 bg-blue-50';
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

  return (
    <div className="px-4 pb-20 relative">
      {loading && <Loading overlay text="불러오는 중..." />}

      <h2 className="text-base font-semibold text-gray-800 leading-snug mb-2">
        {type === 'all' && '전체 내역'}
        {type === 'charge' && '충전 내역'}
        {type === 'settlement' && '정산 내역'}
      </h2>

      {walletTransactions.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">거래 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {walletTransactions.map((tx, idx) => (
            <div
              key={idx}
              className={clsx(
                'flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {tx.main_image ? (
                    <img
                      src={tx.main_image}
                      alt="거래 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="ri-wallet-3-fill text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-base font-medium text-gray-900">
                    {tx.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(tx.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div
                  className={clsx(
                    'px-2 py-1 rounded-full font-medium text-sm',
                    getTransactionTypeColor(tx.type),
                  )}
                >
                  {getTransactionTypeText(tx.type)}
                </div>
                <div className="font-semibold text-lg text-gray-900">
                  {tx.type === 'OUTGOING' ? '-' : '+'}
                  {tx.amount} P
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && !walletTransactions.length && (
        <div className="flex justify-center py-8">
          <Loading text="불러오는 중..." />
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
};

export default WalletHistory;
