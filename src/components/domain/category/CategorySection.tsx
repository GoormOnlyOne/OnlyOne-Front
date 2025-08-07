import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 카테고리 동작 모드 타입 정의
export type CategoryMode = 'navigation' | 'single-select' | 'multi-select';

// Props 타입 정의
interface CategorySectionProps {
  mode?: CategoryMode;
  onCategoryChange?: (categoryId: string | string[]) => void;
  defaultSelected?: string | string[];
  maxSelection?: number; // 최대 선택 개수 추가
}

const categories = [
  {
    id: 'culture',
    label: '문화',
    icon: 'ri-palette-line',
    activeIcon: 'ri-palette-fill',
  },
  {
    id: 'sports',
    label: '운동',
    icon: 'ri-run-line',
    activeIcon: 'ri-run-fill',
  },
  {
    id: 'travel',
    label: '여행',
    icon: 'ri-plane-line',
    activeIcon: 'ri-plane-fill',
  },
  {
    id: 'music',
    label: '음악',
    icon: 'ri-music-2-line',
    activeIcon: 'ri-music-2-fill',
  },
  {
    id: 'craft',
    label: '공예',
    icon: 'ri-scissors-cut-line',
    activeIcon: 'ri-scissors-cut-fill',
  },
  {
    id: 'social',
    label: '사교',
    icon: 'ri-team-line',
    activeIcon: 'ri-team-fill',
  },
  {
    id: 'language',
    label: '외국어',
    icon: 'ri-translate-2',
    activeIcon: 'ri-translate',
  },
  {
    id: 'finance',
    label: '재테크',
    icon: 'ri-money-dollar-circle-line',
    activeIcon: 'ri-money-dollar-circle-fill',
  },
];

export default function CategorySection({
  mode = 'single-select',
  onCategoryChange,
  defaultSelected,
  maxSelection = 5, // 기본값 5
}: CategorySectionProps) {
  const navigate = useNavigate();

  // single-select 모드용 상태
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    typeof defaultSelected === 'string' ? defaultSelected : null,
  );

  // multi-select 모드용 상태
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(defaultSelected) ? defaultSelected : [],
  );

  const handleCategoryClick = (categoryId: string) => {
    switch (mode) {
      case 'navigation':
        // 카테고리 페이지로 이동
        navigate(`/category/${categoryId}`);
        break;

      case 'single-select':
        // 단일 선택 모드
        setSelectedCategory(categoryId);
        // 다음 렌더 사이클에서 부모 컴포넌트 상태 업데이트
        setTimeout(() => onCategoryChange?.(categoryId), 0);
        break;

      case 'multi-select':
        // 다중 선택 모드
        setSelectedCategories(prev => {
          let newSelection: string[];

          if (prev.includes(categoryId)) {
            // 이미 선택된 경우 - 선택 해제
            newSelection = prev.filter(id => id !== categoryId);
          } else {
            // 새로 선택하는 경우
            if (prev.length < maxSelection) {
              // 최대 선택 개수 미만인 경우에만 추가
              newSelection = [...prev, categoryId];
            } else {
              // 최대 선택 개수에 도달한 경우 - 선택하지 않고 알림
              alert(`최대 ${maxSelection}개까지만 선택할 수 있습니다.`);
              return prev; // 상태 변경 없음
            }
          }

          // 다음 렌더 사이클에서 부모 컴포넌트 상태 업데이트
          setTimeout(() => onCategoryChange?.(newSelection), 0);
          return newSelection;
        });
        break;
    }
  };

  // 카테고리가 선택되었는지 확인하는 함수
  const isSelected = (categoryId: string): boolean => {
    if (mode === 'single-select') {
      return selectedCategory === categoryId;
    } else if (mode === 'multi-select') {
      return selectedCategories.includes(categoryId);
    }
    return false;
  };

  // 선택 가능한지 확인하는 함수 (multi-select 모드에서만)
  const isSelectable = (categoryId: string): boolean => {
    if (mode !== 'multi-select') return true;

    // 이미 선택된 경우는 항상 클릭 가능 (선택 해제를 위해)
    if (isSelected(categoryId)) return true;

    // 최대 선택 개수에 도달하지 않은 경우 선택 가능
    return selectedCategories.length < maxSelection;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {categories.map(category => {
          const selected = isSelected(category.id);
          const selectable = isSelectable(category.id);

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              disabled={!selectable && mode === 'multi-select'}
              className={`
                relative flex flex-col items-center justify-center
                aspect-square w-full
                p-2 sm:p-3 rounded-2xl 
                transition-all duration-300 transform
                ${selectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${
                  selected
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 scale-105 shadow-lg'
                    : selectable
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:scale-105'
                      : 'bg-gray-100 opacity-50'
                }
              `}
            >
              {/* 선택된 상태 애니메이션 효과 */}
              {selected && (
                <div className="absolute inset-0 rounded-2xl bg-white opacity-20 animate-pulse" />
              )}

              {/* 아이콘 컨테이너 */}
              <div
                className={`
                w-10 h-10 sm:w-12 sm:h-12 
                flex items-center justify-center mb-1 sm:mb-2 rounded-xl
                transition-all duration-300
                ${selected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/40'}
              `}
              >
                <i
                  className={`
                  ${selected ? category.activeIcon : category.icon}
                  transition-all duration-300
                  ${
                    selected
                      ? 'text-white text-xl sm:text-2xl animate-bounce-once'
                      : selectable
                        ? 'text-gray-700 text-lg sm:text-xl'
                        : 'text-gray-400 text-lg sm:text-xl'
                  }
                `}
                ></i>
              </div>

              {/* 라벨 */}
              <span
                className={`
                text-[10px] sm:text-xs font-medium transition-colors duration-300
                ${
                  selected
                    ? 'text-white'
                    : selectable
                      ? 'text-gray-700'
                      : 'text-gray-400'
                }
              `}
              >
                {category.label}
              </span>

              {/* 다중 선택 모드에서 선택된 개수 표시 */}
              {mode === 'multi-select' && selected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-blue-500">✓</span>
                </div>
              )}

              {/* 선택 불가능한 상태 표시 (최대 선택 도달) */}
              {mode === 'multi-select' && !selectable && !selected && (
                <div className="absolute inset-0 rounded-2xl bg-gray-900/10 flex items-center justify-center">
                  <div className="bg-gray-800/80 text-white text-[10px] px-2 py-1 rounded-full">
                    최대 선택
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택 개수 안내 (multi-select 모드에서만) */}
      {mode === 'multi-select' &&
        selectedCategories.length === maxSelection && (
          <div className="mt-4 text-center">
            <p className="text-sm text-orange-600 font-medium animate-fade-in">
              최대 {maxSelection}개까지 선택 가능합니다.
            </p>
          </div>
        )}
    </div>
  );
}
