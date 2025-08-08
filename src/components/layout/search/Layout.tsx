import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useState } from 'react';

export default function SearchLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 고정 헤더 - 높이를 명시적으로 설정 */}
      <div className="h-14 flex-shrink-0">
        <Header placeholder="모임을 검색하세요" onSearch={handleSearch} />
      </div>

      {/* 스크롤 가능한 메인 영역 */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet context={{ searchQuery }} />
      </main>
    </div>
  );
}
