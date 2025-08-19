import React from 'react';
import clsx from 'clsx';

interface ListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string | React.ReactNode;
  badge?: {
    text: string;
    color: string;
  };
  rightContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  onClick?: () => void;
}

interface ListCardProps {
  title?: string;
  items: ListItem[];
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

const ListCard: React.FC<ListCardProps> = ({
  title,
  items,
  emptyMessage = '데이터가 없습니다.',
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={clsx('px-4 pb-20 relative', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderImage = (image?: string | React.ReactNode) => {
    if (!image) {
      return <i className="ri-file-list-3-line text-gray-400" />;
    }
    if (typeof image === 'string') {
      return (
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
          <img
            src={image}
            alt="아이템 이미지"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return image;
  };

  return (
    <div className={clsx('px-4 pb-20 relative', className)}>
      {title && (
        <h2 className="text-base font-semibold text-gray-800 leading-snug mb-2">
          {title}
        </h2>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={clsx(
                'px-4 py-3 border-b border-gray-100 last:border-b-0',
              )}
            >
              <div
                onClick={item.onClick}
                className={clsx(
                  'flex items-center justify-between',
                  item.onClick &&
                    'cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg -mx-2 px-2 py-1',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    {renderImage(item.image)}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-500 whitespace-pre-line mt-1">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 w-30">
                  {item.badge && (
                    <div
                      className={clsx(
                        'px-2 py-1 rounded-full font-medium text-sm',
                        item.badge.color,
                      )}
                    >
                      {item.badge.text}
                    </div>
                  )}
                  {item.rightContent}
                </div>
              </div>

              {item.bottomContent && (
                <div className="mt-3">{item.bottomContent}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListCard;
