import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, defaultTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || '',
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (tabId === activeTab) return;

      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [activeTab, onTabChange],
  );

  const getTabStyles = (isActive: boolean) => {
    return clsx(
      'py-3 px-4 text-base font-medium transition-all duration-200 cursor-pointer flex-1 text-center',
      isActive
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-gray-300',
    );
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <>
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={getTabStyles(isActive)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTabContent && (
        <div className="tab-content">{activeTabContent}</div>
      )}
    </>
  );
};

export default TabBar;