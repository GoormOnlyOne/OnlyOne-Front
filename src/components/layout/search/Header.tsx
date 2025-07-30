import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchHeaderProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (searchTerm: string) => void;
  onBack?: () => void;
}

export default function SearchHeader({ 
  placeholder = "검색어를 입력하세요", 
  defaultValue = "",
  onSearch,
  onBack 
}: SearchHeaderProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // 기본 동작: 이전 페이지로 이동
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim());
    }
  };

  // enter 눌렀을 때도 검색 동작
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <header className="h-full bg-white border-b border-gray-100">
      <div className="h-full flex items-center px-2 gap-2">
        {/* 뒤로가기 버튼 */}
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="뒤로가기"
        >
          <i className="ri-arrow-left-line text-gray-700 text-xl"></i>
        </button>
        
        {/* 검색 입력 폼 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full h-10 pl-4 pr-10 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          
          {/* 입력 내용 지우기 버튼 */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              aria-label="지우기"
            >
              <i className="ri-close-line text-gray-500 text-sm"></i>
            </button>
          )}
        </div>
        
        {/* 검색 버튼 */}
        <button 
          onClick={handleSearch}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
          aria-label="검색"
        >
          <i className="ri-search-line text-white text-lg"></i>
        </button>
      </div>
    </header>
  );
}