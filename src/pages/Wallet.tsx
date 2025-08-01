import { useState } from 'react';
import TabMenu from '../components/common/TabMenu';
import TransactionList from '../components/domain/wallet/TransactionList';

export const Wallet = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'charge' | 'settlement'>('all');

  const tabItems = [
    { key: 'all', label: '전체' },
    { key: 'charge', label: '충전 내역' },
    { key: 'settlement', label: '정산 내역' }
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'all' | 'charge' | 'settlement');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 탭 메뉴 */}
      <TabMenu 
        items={tabItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 거래 내역 리스트 */}
      <TransactionList filter={activeTab} />
    </div>
  );
};

export { Wallet as default } from './Wallet';