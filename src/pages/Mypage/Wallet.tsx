import { useState } from 'react';
import TabBar, { type TabItem } from '../../components/common/TabBar';
import WalletHistory from './WalletHistory';

export const Settlement = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('탭 변경:', tabId);

    // 탭 변경 시 main 요소 스크롤 맨 위로
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const walletTabs: TabItem[] = [
    {
      id: 'all',
      label: '전체',
      content: <WalletHistory type="all" />,
    },
    {
      id: 'charge',
      label: '충전 내역',
      content: <WalletHistory type="charge" />,
    },
    {
      id: 'settlement',
      label: '정산 내역',
      content: <WalletHistory type="settlement" />,
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50">
      {/* 고정된 탭바 */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <TabBar
          tabs={walletTabs}
          defaultTab="all"
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};

export { Settlement as default } from './Wallet';
