// src/components/common/Loading.tsx
import React from 'react';

type LoadingProps = {
  text?: string;
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  rows?: number;
  className?: string;
};

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
} as const;

function Spinner({ size = 'md' as LoadingProps['size'] }) {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full border-gray-200 animate-spin ${sizeMap[size!]}`}
      style={{ borderTopColor: '#F5921F' }}  // ★ 포인트 색상
    />
  );
}

function Dots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-1">
      <i className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.2s]" style={{ backgroundColor: '#F5921F' }} />
      <i className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.1s]" style={{ backgroundColor: '#F5921F' }} />
      <i className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#F5921F' }} />
    </span>
  );
}

function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Loading({
  text,
  variant = 'spinner',
  size = 'md',
  overlay = false,
  rows = 4,
  className = '',
}: LoadingProps) {
  const body =
    variant === 'dots' ? (
      <Dots />
    ) : variant === 'skeleton' ? (
      <Skeleton rows={rows} />
    ) : (
      <Spinner size={size} />
    );

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-gray-600 ${className}`}
    >
      {body}
      {text && <span className="text-sm">{text}</span>}
      <span className="sr-only">{text || '로딩 중'}</span>
    </div>
  );

  if (!overlay) return content;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      {content}
    </div>
  );
}