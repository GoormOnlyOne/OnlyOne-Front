import CategorySection from '../../domain/category/CategorySection';

interface Step1Props {
  selectedCategories: string[];
  onCategoryChange: (categories: string | string[]) => void;
  maxSelection?: number;
}

const Step1 = ({
  selectedCategories,
  onCategoryChange,
  maxSelection = 5,
}: Step1Props) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">관심사 선택</h2>
      <p className="text-gray-600 text-center mb-2">
        최소 1개에서 최대 {maxSelection}개까지 선택할 수 있습니다.
      </p>
      {selectedCategories.length > 0 && (
        <p className="text-blue-600 text-center mb-6 font-medium">
          {selectedCategories.length}개 선택됨
        </p>
      )}
      <CategorySection
        mode="multi-select"
        onCategoryChange={onCategoryChange}
        initialValue={selectedCategories as any}
        maxSelection={maxSelection}
      />
    </div>
  );
};

export default Step1;
