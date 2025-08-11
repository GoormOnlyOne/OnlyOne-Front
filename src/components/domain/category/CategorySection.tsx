import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../meeting/MeetingForm';

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
  icon: string;
  activeIcon: string;
}[] = [
  {
    id: 'CULTURE',
    label: '문화',
    icon: 'ri-palette-line',
    activeIcon: 'ri-palette-fill',
  },
  {
    id: 'EXERCISE',
    label: '운동',
    icon: 'ri-run-line',
    activeIcon: 'ri-run-fill',
  },
  {
    id: 'TRAVEL',
    label: '여행',
    icon: 'ri-plane-line',
    activeIcon: 'ri-plane-fill',
  },
  {
    id: 'MUSIC',
    label: '음악',
    icon: 'ri-music-2-line',
    activeIcon: 'ri-music-2-fill',
  },
  {
    id: 'CRAFT',
    label: '공예',
    icon: 'ri-scissors-cut-line',
    activeIcon: 'ri-scissors-cut-fill',
  },
  {
    id: 'SOCIAL',
    label: '사교',
    icon: 'ri-team-line',
    activeIcon: 'ri-team-fill',
  },
  {
    id: 'LANGUAGE',
    label: '외국어',
    icon: 'ri-translate-2',
    activeIcon: 'ri-translate',
  },
  {
    id: 'FINANCE',
    label: '재테크',
    icon: 'ri-money-dollar-circle-line',
    activeIcon: 'ri-money-dollar-circle-fill',
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
            alert(`최대 ${maxSelection}개까지만 선택할 수 있습니다.`);
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
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {categories.map(({ id, label, icon, activeIcon }) => {
          const selected = isSelected(id);
          const selectable = isSelectable(id);

          return (
            <button
              key={id}
              onClick={() => handleCategoryClick(id)}
              disabled={!selectable && mode === 'multi-select'}
              className={`
                relative flex flex-col items-center justify-center aspect-square w-full p-3 sm:p-4 rounded-2xl 
                transition-all duration-300 transform
                ${selectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${
                  selected
                    ? 'bg-gradient-to-br from-[#F5921F] to-[#FFAE00] text-white shadow-2xl scale-105'
                    : selectable
                      ? 'bg-white shadow-md hover:shadow-xl hover:scale-105 border border-[#F4B187]/30'
                      : 'bg-gray-100 opacity-50'
                }
              `}
            >
              {/* 아이콘을 더 크고 강조 */}
              <div
                className={`
                w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl mb-2 sm:mb-3 transition-all duration-300
                ${
                  selected
                    ? 'bg-white/20 backdrop-blur-sm'
                    : selectable
                      ? 'bg-gradient-to-br from-[#F4B187]/20 to-[#FFAE00]/20 hover:from-[#F5921F]/20 hover:to-[#FFAE00]/30'
                      : 'bg-gray-200'
                }
              `}
              >
                <i
                  className={`
                  ${selected ? activeIcon : icon} text-2xl sm:text-3xl transition-all duration-300
                  ${
                    selected
                      ? 'text-white'
                      : selectable
                        ? 'text-[#F5921F] hover:text-[#EF7C30]'
                        : 'text-gray-400'
                  }
                `}
                />
              </div>

              <span
                className={`
                text-xs sm:text-lg font-semibold transition-colors duration-300
                ${
                  selected
                    ? 'text-white'
                    : selectable
                      ? 'text-[#7E4805] hover:text-[#F5921F]'
                      : 'text-gray-400'
                }
              `}
              >
                {label}
              </span>

              {/* 다중 선택 체크 마크 */}
              {mode === 'multi-select' && selected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-[#F5921F]">✓</span>
                </div>
              )}

              {/* 선택 불가능 오버레이 */}
              {mode === 'multi-select' && !selectable && !selected && (
                <div className="absolute inset-0 rounded-2xl bg-gray-900/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-[#7E4805]/90 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
                    최대 선택
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 최대 선택 안내 메시지 */}
      {mode === 'multi-select' &&
        selectedCategories.length === maxSelection && (
          <div className="mt-4 text-center">
            <div className="bg-[#FFAE00]/20 border-2 border-[#FFAE00] rounded-2xl px-4 py-2 inline-block">
              <p className="text-sm text-[#7E4805] font-semibold">
                최대 {maxSelection}개까지 선택 가능합니다.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
