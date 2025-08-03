import React, { useState } from 'react';

export { Settlement as default } from './SettlementHistory'; 

interface Settlement {
  id: number;
  clubName: string;
  eventName: string;
  status: 'PENDING' | 'COMPLETED' | 'CONFIRMED';
  amount: number;
  date: string;
  participants: number;
  isLeader: boolean;
}

const mockSettlements: Settlement[] = [
  {
    id: 1,
    clubName: '모임 이름',
    eventName: '정기 모임 이름',
    status: 'PENDING',
    amount: 15000,
    date: '2025-07-31',
    participants: 8,
    isLeader: false
  },
  {
    id: 2,
    clubName: '한강 러닝 크루',
    eventName: '주말 러닝 모임',
    status: 'COMPLETED',
    amount: 12000,
    date: '2025-07-28',
    participants: 12,
    isLeader: true
  },
  {
    id: 3,
    clubName: '북클럽 독서모임',
    eventName: '7월 독서 모임',
    status: 'CONFIRMED',
    amount: 8000,
    date: '2025-07-25',
    participants: 6,
    isLeader: false
  },
  {
    id: 4,
    clubName: '요리 클래스',
    eventName: '이탈리안 요리 체험',
    status: 'PENDING',
    amount: 25000,
    date: '2025-07-30',
    participants: 10,
    isLeader: false
  }
];

export const Settlement = () => {
  const [settlements] = useState<Settlement[]>(mockSettlements);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          text: '정산 대기',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          icon: 'ri-time-line'
        };
      case 'COMPLETED':
        return {
          text: '정산 완료',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: 'ri-check-line'
        };
      case 'CONFIRMED':
        return {
          text: '확인 완료',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: 'ri-shield-check-line'
        };
      default:
        return {
          text: '알 수 없음',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: 'ri-question-line'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '원';
  };

  const handleSettlementClick = (settlement: Settlement) => {
    console.log('정산 내역 클릭:', settlement);
    // 여기에 상세 정산 내역 보기 로직 추가
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* 안내 텍스트 */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            참여한 모임의 정산 내역을 확인할 수 있습니다.
          </p>
        </div>

        {/* 정산 내역 리스트 */}
        <div className="space-y-4">
          {settlements.map((settlement) => {
            const statusInfo = getStatusInfo(settlement.status);
            
            return (
              <div
                key={settlement.id}
                onClick={() => handleSettlementClick(settlement)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* 모임 이름 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        ({settlement.clubName})
                      </span>
                      {settlement.isLeader && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          리더
                        </span>
                      )}
                    </div>
                    
                    {/* 정기 모임 이름 */}
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {settlement.eventName}
                    </h3>
                    
                    {/* 날짜와 참여자 수 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>
                        <span>{formatDate(settlement.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="ri-group-line"></i>
                        <span>{settlement.participants}명</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 상태 뱃지 */}
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                    <i className={`${statusInfo.icon} text-xs`}></i>
                    <span className="text-xs font-medium">{statusInfo.text}</span>
                  </div>
                </div>

                {/* 금액과 화살표 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">정산 금액:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatAmount(settlement.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {settlement.status === 'PENDING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('정산하기 클릭:', settlement.id);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium hover:bg-blue-600 transition-colors"
                      >
                        정산하기
                      </button>
                    )}
                    <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 빈 상태 (정산 내역이 없을 때) */}
        {settlements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="ri-file-list-3-line text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              정산 내역이 없습니다
            </h3>
            <p className="text-sm text-gray-600 text-center">
              모임에 참여하면 정산 내역을 확인할 수 있어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}