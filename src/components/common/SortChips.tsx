import React from 'react';

type SortKey = 'latest' | 'popular';

interface Props {
  value: SortKey;
  onChange: (k: SortKey) => void;
  className?: string;
}

export default function SortChips({ value, onChange, className = '' }: Props) {
  const options: { key: SortKey; label: string; icon: string }[] = [
    { key: 'latest', label: '최신순', icon: 'ri-time-line' }, // 왼쪽
    { key: 'popular', label: '인기순', icon: 'ri-fire-line' }, // 오른쪽
  ];

  return (
    <div className={`flex gap-3 ${className}`}>
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => value !== o.key && onChange(o.key)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${
              value === o.key
                ? 'bg-brand-light text-brand-primary border border-brand-primary'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          aria-pressed={value === o.key}
        >
          <i className={`${o.icon} text-base`}></i>
          {o.label}
        </button>
      ))}
    </div>
  );
}
