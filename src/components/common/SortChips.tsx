import React from 'react';

type SortKey = 'latest' | 'popular';

interface Props {
  value: SortKey;
  onChange: (k: SortKey) => void;
  className?: string;
}

export default function SortChips({ value, onChange, className = '' }: Props) {
  const options: { key: SortKey; label: string }[] = [
    { key: 'latest', label: '최신순' },   // 왼쪽
    { key: 'popular', label: '인기순' },  // 오른쪽
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => value !== o.key && onChange(o.key)}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border transition
            ${value === o.key
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
          aria-pressed={value === o.key}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
