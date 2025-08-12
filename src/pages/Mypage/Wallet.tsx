import { useState } from 'react';
import TabBar, { type TabItem } from '../../components/common/TabBar';
import WalletHistory from './WalletHistory';

export const Wallet = () => {
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
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* 고정된 탭바 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex">
          {walletTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-4 text-base font-medium transition-all duration-200 cursor-pointer flex-1 text-center ${
                  isActive
                    ? 'text-brand-primary border-b-2 border-brand-primary'
                    : 'text-gray-600 hover:text-brand-primary border-b-2 border-transparent hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 - 탭바(50px) 높이만 제외 */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 50px)' }}>
        {walletTabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export { Wallet as default } from './Wallet';
