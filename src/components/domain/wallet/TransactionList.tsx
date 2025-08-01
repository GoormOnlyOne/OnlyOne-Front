import { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  type: 'charge' | 'settlement';
  title: string;
  date: string;
  amount: string;
  image?: string;
}

interface TransactionListProps {
  filter: 'all' | 'charge' | 'settlement';
}

export default function TransactionList({ filter }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 임시 거래 내역 데이터 생성 함수
  const generateMockTransactions = (page: number = 0): Transaction[] => {
    const baseTransactions = [
      { type: 'charge' as const, title: '포인트 충전', amount: '+10,000P' },
      { type: 'settlement' as const, title: '독서 모임 정산', amount: '-5,000P' },
      { type: 'charge' as const, title: '포인트 충전', amount: '+20,000P' },
      { type: 'settlement' as const, title: '운동 모임 정산', amount: '-8,000P' },
      { type: 'settlement' as const, title: '요리 모임 정산', amount: '-12,000P' },
      { type: 'charge' as const, title: '포인트 충전', amount: '+15,000P' },
      { type: 'settlement' as const, title: '영화 모임 정산', amount: '-6,000P' },
      { type: 'charge' as const, title: '포인트 충전', amount: '+30,000P' },
    ];

    return baseTransactions.map((transaction, index) => ({
      id: page * 8 + index + 1,
      ...transaction,
      date: new Date(Date.now() - (page * 8 + index) * 24 * 60 * 60 * 1000).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }));
  };

  // 초기 데이터 로드
  useEffect(() => {
    setTransactions(generateMockTransactions(0));
  }, []);

  // 필터링된 거래 내역
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  // 무한 스크롤 처리
  const loadMoreTransactions = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // API 호출 시뮬레이션
    setTimeout(() => {
      const currentPage = Math.floor(transactions.length / 8);
      const newTransactions = generateMockTransactions(currentPage);
      
      setTransactions(prev => [...prev, ...newTransactions]);
      setIsLoading(false);
      
      // 3페이지까지만 로드 (임시)
      if (currentPage >= 2) {
        setHasMore(false);
      }
    }, 1000);
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreTransactions();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, transactions.length]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'charge': return '충전';
      case 'settlement': return '정산';
      default: return '기타';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'charge': return 'text-green-600';
      case 'settlement': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="px-4 py-4">
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-file-list-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">거래 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  {/* 왼쪽 이미지/아이콘 */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                    <i className={`
                      ${transaction.type === 'charge' ? 'ri-add-circle-line text-green-600' : 'ri-subtract-line text-red-600'}
                      text-xl
                    `}></i>
                  </div>
                  
                  {/* 텍스트 정보 */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          transaction.type === 'charge' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {transaction.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                        <p className={`text-sm font-semibold mt-1 ${getTypeColor(transaction.type)}`}>
                          {transaction.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">로딩 중...</span>
              </div>
            </div>
          )}

          {/* 더 이상 데이터가 없을 때 */}
          {!hasMore && filteredTransactions.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">모든 거래 내역을 불러왔습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}