import React, { useState, useCallback } from 'react';

export const TabBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'board' | 'chat'>('home');

  const handleTabClick = useCallback((tabId: 'home' | 'board' | 'chat') => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
  }, [activeTab]);

  const tabs = [
    { id: 'home' as const, label: '홈' },
    { id: 'board' as const, label: '게시판' },
    { id: 'chat' as const, label: '채팅' }
  ];

  return (
    <div>
      {/* 탭 헤더 */}
      <div className="flex bg-gray-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-400 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div className="p-4">
        {activeTab === 'home' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">정기모임</h3>
            {/* TODO: API에서 모임 데이터 가져와서 렌더링 */}
            <div className="text-gray-500 text-center py-8">
              정기모임 데이터를 불러오는 중...
            </div>
          </div>
        )}
        
        {activeTab === 'board' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">모임 사진</h3>
            {/* TODO: API에서 사진 데이터 가져와서 렌더링 */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">채팅방</h3>
            {/* TODO: API에서 채팅방 목록 가져와서 렌더링 */}
            <div className="text-gray-500 text-center py-8">
              채팅 목록을 불러오는 중...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabBar;