import { useState, useEffect } from 'react';
import clsx from 'clsx';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';

interface WalletTransaction {
  type: 'INCOMING' | 'OUTGOING' | 'CHARGE';
  title: string;
  amount: number;
  main_image: string;
  created_at: Date;
}

interface WalletHistoryProps {
  type: 'all' | 'charge' | 'settlement';
}

export const WalletHistory = ({ type }: WalletHistoryProps) => {
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);

  const getFilterParam = (type: string) => {
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
    setLoading(true);

    const dummyData: WalletTransaction[] = [
      {
        type: 'INCOMING',
        title: '모임이름: 정기모임이름',
        amount: 5000,
        main_image:
          'https://readdy.ai/api/search-image?query=People%20running%20together%20in%20Han%20River%20park%20Seoul%2C%20morning%20exercise%2C%20beautiful%20sunrise%2C%20group%20activity%2C%20healthy%20lifestyle%2C%20outdoor%20sports%2C%20Korean%20cityscape%20in%20background%2C%20vibrant%20and%20energetic%20atmosphere&width=400&height=240&seq=1&orientation=landscape',
        created_at: new Date('2025-07-31T14:09:44.133622'),
      },
      {
        type: 'OUTGOING',
        title: '모임이름: 정기모임이름',
        amount: 3000,
        main_image:
          'https://readdy.ai/api/search-image?query=Italian%20cooking%20class%2C%20people%20making%20pasta%20together%2C%20modern%20kitchen%20studio%2C%20ingredients%20and%20cooking%20tools%2C%20warm%20lighting%2C%20collaborative%20cooking%20experience%2C%20professional%20chef%20instruction%2C%20cozy%20atmosphere&width=400&height=240&seq=2&orientation=landscape',
        created_at: new Date('2025-07-30T10:30:00.000000'),
      },
      {
        type: 'CHARGE',
        title: '지갑 충전',
        amount: 10000,
        main_image: 'string.png',
        created_at: new Date('2025-07-29T15:20:00.000000'),
      },
      {
        type: 'INCOMING',
        title: '모임이름: 주말등산모임',
        amount: 8000,
        main_image:
          'https://readdy.ai/api/search-image?query=Cozy%20book%20cafe%20reading%20group%2C%20people%20discussing%20books%2C%20warm%20lighting%2C%20comfortable%20seating%2C%20bookshelves%2C%20coffee%20cups%2C%20intellectual%20atmosphere%2C%20modern%20interior%20design%2C%20peaceful%20ambiance&width=400&height=240&seq=3&orientation=landscape',
        created_at: new Date('2025-07-28T09:15:00.000000'),
      },
    ];

    const filteredData = dummyData.filter(transaction => {
      if (filter === 'ALL') return true;
      if (filter === 'CHARGE') return transaction.type === 'CHARGE';
      if (filter === 'TRANSACTION') {
        return (
          transaction.type === 'INCOMING' || transaction.type === 'OUTGOING'
        );
      }
      return true;
    });

    setWalletTransactions(filteredData);
    setLoading(false);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="px-4 pb-20">
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
          {walletTransactions.map((transaction, index) => (
            <div
              key={index}
              className={clsx(
                'flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {transaction.main_image ? (
                    <img
                      src={transaction.main_image}
                      alt="거래 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="ri-wallet-3-fill text-gray-400" />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="text-base font-medium text-gray-900">
                    {transaction.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div
                  className={clsx(
                    'px-2 py-1 rounded-full font-medium text-sm',
                    getTransactionTypeColor(transaction.type),
                  )}
                >
                  {getTransactionTypeText(transaction.type)}
                </div>
                <div className="font-semibold text-lg text-gray-900">
                  {transaction.type === 'OUTGOING' ? '-' : '+'}
                  {transaction.amount} P
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
};

export { WalletHistory as default } from './WalletHistory';
