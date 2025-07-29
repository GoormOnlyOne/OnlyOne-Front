import { useState } from 'react';
import CategorySection, { CategorySectionType } from '../components/domain/category/CategorySection';

export const CategoryDemo = () => {
  const [currentType, setCurrentType] = useState<CategorySectionType>('filter');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  const handleCategorySelect = (categoryId: string | string[]) => {
    if (currentType === 'filter') {
      setSelectedFilter(categoryId as string);
    } else if (currentType === 'multiSelect') {
      setMultiSelected(categoryId as string[]);
    }
  };

  const handleNavigate = (categoryId: string) => {
    alert(`${categoryId} 카테고리 페이지로 이동합니다!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          CategorySection 타입별 동작
        </h1>
        
        {/* 타입 선택 버튼 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setCurrentType('navigation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentType === 'navigation'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Navigation
          </button>
          <button
            onClick={() => setCurrentType('filter')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentType === 'filter'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Filter
          </button>
          <button
            onClick={() => setCurrentType('multiSelect')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentType === 'multiSelect'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Multi Select
          </button>
        </div>

        {/* 현재 타입 설명 */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            현재 모드: {currentType}
          </h3>
          <p className="text-sm text-gray-600">
            {currentType === 'navigation' && '카테고리를 클릭하면 해당 페이지로 이동합니다.'}
            {currentType === 'filter' && '카테고리를 선택하면 해당 카테고리의 내용만 표시됩니다.'}
            {currentType === 'multiSelect' && '여러 카테고리를 동시에 선택할 수 있습니다.'}
          </p>
        </div>

        {/* CategorySection */}
        <CategorySection
          type={currentType}
          onCategorySelect={handleCategorySelect}
          onNavigate={handleNavigate}
          selectedCategories={multiSelected}
        />

        {/* 선택된 상태 표시 */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">선택된 상태:</h3>
          {currentType === 'navigation' && (
            <p className="text-sm text-gray-600">
              네비게이션 모드에서는 선택 상태를 유지하지 않습니다.
            </p>
          )}
          {currentType === 'filter' && (
            <p className="text-sm text-gray-600">
              선택된 카테고리: {selectedFilter || '없음'}
            </p>
          )}
          {currentType === 'multiSelect' && (
            <p className="text-sm text-gray-600">
              선택된 카테고리들: {multiSelected.length > 0 ? multiSelected.join(', ') : '없음'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDemo;