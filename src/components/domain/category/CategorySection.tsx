import { useState } from 'react';

// 카테고리 데이터 타입
interface Category {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
}

// CategorySection 동작 타입
export type CategorySectionType = 'navigation' | 'filter' | 'multiSelect';

interface CategorySectionProps {
  type?: CategorySectionType;
  onCategorySelect?: (categoryId: string | string[]) => void;
  onNavigate?: (categoryId: string) => void;
  selectedCategories?: string[];
}

const categories: Category[] = [
  { 
    id: 'culture', 
    label: '문화', 
    icon: 'ri-palette-line', 
    activeIcon: 'ri-palette-fill'
  },
  { 
    id: 'sports', 
    label: '운동', 
    icon: 'ri-run-line', 
    activeIcon: 'ri-run-fill'
  },
  { 
    id: 'travel', 
    label: '여행', 
    icon: 'ri-plane-line', 
    activeIcon: 'ri-plane-fill'
  },
  { 
    id: 'music', 
    label: '음악', 
    icon: 'ri-music-2-line', 
    activeIcon: 'ri-music-2-fill'
  },
  { 
    id: 'craft', 
    label: '공예', 
    icon: 'ri-scissors-cut-line', 
    activeIcon: 'ri-scissors-cut-fill'
  },
  { 
    id: 'social', 
    label: '사교', 
    icon: 'ri-team-line', 
    activeIcon: 'ri-team-fill'
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
    activeIcon: 'ri-money-dollar-circle-fill'
  }
];

export default function CategorySection({ 
  type = 'filter', 
  onCategorySelect, 
  onNavigate,
  selectedCategories = []
}: CategorySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [multiSelectedCategories, setMultiSelectedCategories] = useState<string[]>(selectedCategories);

  const handleCategoryClick = (categoryId: string) => {
    switch (type) {
      case 'navigation':
        // 네비게이션 타입: 페이지 이동
        if (onNavigate) {
          onNavigate(categoryId);
        }
        break;
        
      case 'filter':
        // 필터 타입: 단일 선택으로 내용 필터링
        const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(newSelectedCategory);
        if (onCategorySelect) {
          onCategorySelect(newSelectedCategory || '');
        }
        break;
        
      case 'multiSelect':
        // 다중 선택 타입: 여러 카테고리 선택 가능
        const updatedCategories = multiSelectedCategories.includes(categoryId)
          ? multiSelectedCategories.filter(id => id !== categoryId)
          : [...multiSelectedCategories, categoryId];
        
        setMultiSelectedCategories(updatedCategories);
        if (onCategorySelect) {
          onCategorySelect(updatedCategories);
        }
        break;
    }
  };

  const isSelected = (categoryId: string): boolean => {
    switch (type) {
      case 'navigation':
        return false; // 네비게이션은 선택 상태를 유지하지 않음
      case 'filter':
        return selectedCategory === categoryId;
      case 'multiSelect':
        return multiSelectedCategories.includes(categoryId);
      default:
        return false;
    }
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category) => {
          const selected = isSelected(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                relative flex flex-col items-center justify-center
                aspect-square w-full
                p-2 sm:p-3 rounded-2xl 
                transition-all duration-300 transform
                cursor-pointer
                ${selected 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 scale-105 shadow-lg' 
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:scale-105'
                }
                ${type === 'navigation' ? 'hover:shadow-md' : ''}
              `}
            >
              {/* 선택된 상태 애니메이션 효과 */}
              {selected && (
                <div className="absolute inset-0 rounded-2xl bg-white opacity-20 animate-pulse" />
              )}
              
              {/* 다중 선택 시 체크 표시 */}
              {type === 'multiSelect' && selected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-xs text-blue-500"></i>
                </div>
              )}
              
              {/* 아이콘 컨테이너 */}
              <div className={`
                w-10 h-10 sm:w-12 sm:h-12 
                flex items-center justify-center mb-1 sm:mb-2 rounded-xl
                transition-all duration-300
                ${selected 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-white/40'
                }
              `}>
                <i className={`
                  ${selected ? category.activeIcon : category.icon}
                  transition-all duration-300
                  ${selected 
                    ? 'text-white text-xl sm:text-2xl animate-bounce-once' 
                    : 'text-gray-700 text-lg sm:text-xl'
                  }
                `}></i>
              </div>
              
              {/* 라벨 */}
              <span className={`
                text-[10px] sm:text-xs font-medium transition-colors duration-300
                ${selected ? 'text-white' : 'text-gray-700'}
              `}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}