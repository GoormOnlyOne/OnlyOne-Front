import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../meeting/MeetingForm';
import Alert from '../../../components/common/Alert';

// 카테고리 동작 모드 타입 정의
export type CategoryMode = 'navigation' | 'single-select' | 'multi-select';

// Props 타입 정의
interface CategorySectionProps {
  mode?: CategoryMode;
  /** 단일 또는 다중 선택 초기값(수정 모드에서) */
  initialValue?: Category | Category[];
  /** 기존 호환성을 위한 defaultSelected (deprecated) */
  defaultSelected?: string | string[];
  /** 선택이 바뀔 때 호출되는 콜백 */
  onCategoryChange?: (category: Category | Category[]) => void;
  /** 다중 선택 시 최대 개수 */
  maxSelection?: number;
}

// 실제 표시될 카테고리 목록 (백엔드 enum과 1:1 매핑되는 ID)
const categories: {
  id: Category;
  label: string;
  emoji: string;
}[] = [
  {
    id: 'CULTURE',
    label: '문화',
    emoji: '🎨',
  },
  {
    id: 'EXERCISE',
    label: '운동',
    emoji: '🏃🏻‍♂️',
  },
  {
    id: 'TRAVEL',
    label: '여행',
    emoji: '✈️',
  },
  {
    id: 'MUSIC',
    label: '음악',
    emoji: '🎵',
  },
  {
    id: 'CRAFT',
    label: '공예',
    emoji: '✂️',
  },
  {
    id: 'SOCIAL',
    label: '사교',
    emoji: '💁🏻',
  },
  {
    id: 'LANGUAGE',
    label: '외국어',
    emoji: '🌐',
  },
  {
    id: 'FINANCE',
    label: '재테크',
    emoji: '💵',
  },
];

export default function CategorySection({
  mode = 'single-select',
  initialValue,
  onCategoryChange,
  maxSelection = 5,
}: CategorySectionProps) {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    typeof initialValue === 'string' ? initialValue : null,
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    Array.isArray(initialValue) ? initialValue : [],
  );

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    if (mode === 'single-select' && typeof initialValue === 'string') {
      setSelectedCategory(initialValue);
    }
    if (mode === 'multi-select' && Array.isArray(initialValue)) {
      setSelectedCategories(initialValue);
    }
  }, [initialValue, mode]);

  const handleCategoryClick = (cat: Category) => {
    switch (mode) {
      case 'navigation':
        navigate(`/category?select=${cat}`);
        break;

      case 'single-select':
        setSelectedCategory(cat);
        setTimeout(() => onCategoryChange?.(cat), 0);
        break;

      case 'multi-select':
        setSelectedCategories(prev => {
          let next: Category[];
          if (prev.includes(cat)) {
            next = prev.filter(id => id !== cat);
          } else if (prev.length < maxSelection) {
            next = [...prev, cat];
          } else {
            setAlertMsg(`최대 ${maxSelection}개까지만 선택할 수 있습니다.`);
            setIsAlertOpen(true);
            return prev;
          }

          setTimeout(() => onCategoryChange?.(next), 0);
          return next;
        });
        break;
    }
  };

  const isSelected = (cat: Category) =>
    mode === 'multi-select'
      ? selectedCategories.includes(cat)
      : selectedCategory === cat;

  const isSelectable = (cat: Category) => {
    if (mode !== 'multi-select') return true;
    if (isSelected(cat)) return true;
    return selectedCategories.length < maxSelection;
  };

  return (
    <>
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {categories.map(({ id, label, emoji }) => {
          const selected = isSelected(id);
          const selectable = isSelectable(id);

          return (
            <button
              key={id}
              onClick={() => handleCategoryClick(id)}
              disabled={!selectable && mode === 'multi-select'}
              className={`relative flex flex-col items-center justify-center aspect-square w-full p-2 sm:p-3 rounded-2xl transition-all duration-300 transform group
                ${selectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${
                  selected
                    ? 'bg-gradient-to-br from-brand-primary via-brand-secondary to-[#FFAE00] scale-105 shadow-lg shadow-brand-warm/30'
                    : selectable
                      ? 'bg-gradient-to-br from-brand-light to-brand-soft hover:from-brand-primary/60 hover:via-brand-secondary/60 hover:to-[#FFAE00]/60 hover:scale-105 hover:shadow-md hover:shadow-brand-warm/20'
                      : 'bg-neutral-100 opacity-50'
                }
              `}
            >
              {selected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-white/20 to-white/10 animate-pulse" />
              )}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1 sm:mb-2 rounded-xl transition-all duration-300 ${selected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/40'}`}
              >
                <span
                  className={`transition-all duration-300 ${selected ? 'text-2xl sm:text-3xl animate-bounce-once drop-shadow-sm' : selectable ? 'text-xl sm:text-2xl group-hover:scale-110' : 'text-xl sm:text-2xl opacity-50'}`}
                >
                  {emoji}
                </span>
              </div>

              <span
                className={`${selected ? 'text-white font-semibold drop-shadow-sm' : selectable ? 'text-brand-deepest group-hover:text-white font-medium' : 'text-neutral-400'} text-xs sm:text-sm transition-all duration-300`}
              >
                {label}
              </span>

              {mode === 'multi-select' && selected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-brand-primary drop-shadow-sm">✓</span>
                </div>
              )}
              {mode === 'multi-select' && !selectable && !selected && (
                <div className="absolute inset-0 rounded-2xl bg-neutral-900/10 flex items-center justify-center">
                  <div className="bg-neutral-600/90 text-white text-[10px] px-2 py-1 rounded-full shadow-sm">
                    최대 선택
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {mode === 'multi-select' && selectedCategories.length === maxSelection && (
        <div className="mt-4 text-center">
          <p className="text-sm text-brand-primary font-semibold animate-fade-in bg-brand-light/50 py-2 px-4 rounded-full">
            최대 {maxSelection}개까지 선택 가능합니다.
          </p>
        </div>
      )}
    </div>

    <Alert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => setIsAlertOpen(false)}
        title={alertMsg}
        variant="default"
        cancelText="닫기"
        confirmText="확인"
      />
    </>
  );
}
