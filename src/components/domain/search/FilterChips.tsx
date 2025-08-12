interface SearchFilters {
  city: string;
  district: string;
  interestId: number | null;
  sortBy: 'LATEST' | 'MEMBER_COUNT';
}

interface Interest {
  interestId: number;
  category: string;
}

interface FilterChipsProps {
  filters: SearchFilters;
  interests?: Interest[];
  onRemoveFilter: (key: keyof SearchFilters) => void;
  onClearAll: () => void;
}

export const FilterChips = ({
  filters,
  interests = [],
  onRemoveFilter,
  onClearAll,
}: FilterChipsProps) => {
  const activeFilters = [];

  // 지역 필터
  if (filters.city) {
    activeFilters.push({
      key: 'city' as keyof SearchFilters,
      label: filters.district
        ? `${filters.city} ${filters.district}`
        : filters.city,
      value: filters.city,
    });
  }

  // 관심사 필터
  if (filters.interestId && interests.length > 0) {
    const interest = interests.find(i => i.interestId === filters.interestId);
    if (interest) {
      activeFilters.push({
        key: 'interestId' as keyof SearchFilters,
        label: interest.category,
        value: filters.interestId,
      });
    }
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2 flex-wrap">
        {/* 활성 필터 칩들 */}
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.key}-${index}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-full text-sm font-medium"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className="rounded-full p-0.5 transition-colors hover:bg-white/20"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        ))}

        {/* 전체 삭제 버튼 */}
        {activeFilters.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium ml-2"
          >
            전체 삭제
          </button>
        )}
      </div>
    </div>
  );
};
