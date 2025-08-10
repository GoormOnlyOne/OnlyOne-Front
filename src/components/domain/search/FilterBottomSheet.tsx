import { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet';
import koreanRegions from '../../../assets/json/korea_administrative_divisions.json';

interface SearchFilters {
  city: string;
  district: string;
  interestId: number | null;
  sortBy: 'LATEST' | 'MEMBER_COUNT';
}

interface Interest {
  interestId: number;
  category: string;
}

interface RegionData {
  type: string;
  districts: string[];
}

interface KoreanRegions {
  korea_administrative_divisions: {
    [key: string]: RegionData;
  };
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  interests: Interest[];
}

const getCities = () => {
  return Object.entries((koreanRegions as KoreanRegions).korea_administrative_divisions).map(([city, data]) => ({
    name: city,
    districts: data.districts
  }));
};

const getDistrictsForCity = (cityName: string): string[] => {
  const cityData = (koreanRegions as KoreanRegions).korea_administrative_divisions[cityName];
  return cityData ? cityData.districts : [];
};

export const FilterBottomSheet = ({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters, 
  interests 
}: FilterBottomSheetProps) => {
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters, isOpen]);

  useEffect(() => {
    if (tempFilters.city) {
      setAvailableDistricts(getDistrictsForCity(tempFilters.city));
    } else {
      setAvailableDistricts([]);
    }
  }, [tempFilters.city]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | null) => {
    let newFilters = { ...tempFilters, [key]: value };
    
    if (key === 'city' && value) {
      const districts = getDistrictsForCity(value as string);
      newFilters = { ...newFilters, district: districts.length > 0 ? districts[0] : '' };
    } else if (key === 'city' && !value) {
      newFilters = { ...newFilters, district: '' };
    }
    
    setTempFilters(newFilters);
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      city: '',
      district: '',
      interestId: null,
      sortBy: 'MEMBER_COUNT' as const
    };
    setTempFilters(resetFilters);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="필터" showCloseButton={false}>
      <div className="px-6 pb-6 space-y-6">
        {/* 정렬 */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">정렬</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('sortBy', 'MEMBER_COUNT')}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                tempFilters.sortBy === 'MEMBER_COUNT'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => handleFilterChange('sortBy', 'LATEST')}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                tempFilters.sortBy === 'LATEST'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              최신순
            </button>
          </div>
        </div>

        {/* 지역 */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">지역</label>
          <div className="space-y-3">
            <select
              value={tempFilters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체 지역</option>
              {getCities().map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            
            {tempFilters.city && (
              <select
                value={tempFilters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 관심사 */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">관심사</label>
          <select
            value={tempFilters.interestId || ''}
            onChange={(e) => handleFilterChange('interestId', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">전체 관심사</option>
            {interests.map(interest => (
              <option key={interest.interestId} value={interest.interestId}>
                {interest.category}
              </option>
            ))}
          </select>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white pt-4 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              className="flex-2 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              결과 보기
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};