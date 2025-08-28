import React, { useState, useCallback, useEffect } from 'react';
import KoreaData from '../../assets/json/korea_administrative_divisions.json';

// JSON 데이터 타입 정의
interface DistrictData {
  type: string;
  districts: string[];
}

interface KoreaAdministrativeData {
  [key: string]: DistrictData;
}

interface KoreaDataType {
  korea_administrative_divisions: KoreaAdministrativeData;
  summary: {
    total_provinces: number;
    total_districts: number;
    special_cities: number;
    metropolitan_cities: number;
    special_autonomous_cities: number;
    special_autonomous_provinces: number;
    provinces: number;
  };
}

// 타입 단언을 통한 안전한 타입 캐스팅
const typedKoreaData = KoreaData as KoreaDataType;

export interface AddressData {
  city: string;
  district: string;
  isComplete: boolean;
}

interface AddressSelectorProps {
  onAddressChange?: (address: AddressData) => void;
  onCityChange?: (city: string) => void;
  onDistrictChange?: (district: string) => void;
  className?: string;
  initialCity?: string;
  initialDistrict?: string;
  placeholder?: {
    city?: string;
    district?: string;
  };
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  onAddressChange,
  onCityChange,
  onDistrictChange,
  className = '',
  initialCity = '',
  initialDistrict = '',
  placeholder = {
    city: '시/도를 선택하세요',
    district: '시/군/구를 선택하세요',
  },
}) => {
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>(initialDistrict);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  // initialCity와 initialDistrict가 변경될 때 상태 업데이트
  useEffect(() => {
    if (initialCity) {
      setSelectedCity(initialCity);
    }
    if (initialDistrict) {
      setSelectedDistrict(initialDistrict);
    }
  }, [initialCity, initialDistrict]);

  const cities = Object.keys(typedKoreaData.korea_administrative_divisions);
  const districts = selectedCity
    ? typedKoreaData.korea_administrative_divisions[selectedCity]?.districts ||
      []
    : [];

  // 주소 선택 완료 여부
  const isComplete = useCallback(() => {
    if (!selectedCity) return false;

    // 선택된 시/도에 구/군이 있는 경우 구/군도 선택되어야함
    if (districts.length > 0) {
      return selectedDistrict !== '';
    }

    // 구/군이 없는 경우 (세종)
    return true;
  }, [selectedCity, selectedDistrict, districts.length]);

  // 간단한 이름 변환 함수 (이미 간소화된 이름이므로 그대로 반환)
  const getSimpleName = useCallback((name: string) => {
    return name;
  }, []);


  // 주소 변경 시 완료 상태와 함께 콜백 호출
  useEffect(() => {
    const addressData: AddressData = {
      city: selectedCity,
      district: selectedDistrict,
      isComplete: isComplete(),
    };
    onAddressChange?.(addressData);
  }, [selectedCity, selectedDistrict, isComplete]);


  const handleCityChange = useCallback(
    (city: string) => {
      setSelectedCity(city);

      // 새로 선택된 시/도의 구/군 목록 가져오기
      const newDistricts =
        typedKoreaData.korea_administrative_divisions[city]?.districts || [];

      const firstDistrict = newDistricts.length > 0 ? newDistricts[0] : '';
      setSelectedDistrict(firstDistrict);

      // 콜백 호출
      onCityChange?.(city);
      if (firstDistrict) {
        onDistrictChange?.(firstDistrict);
      }

      // 드롭다운 닫기
      setIsCityOpen(false);
    },
    [onCityChange, onDistrictChange],
  );

  const handleDistrictChange = useCallback(
    (district: string) => {
      setSelectedDistrict(district);

      // 콜백 호출
      onDistrictChange?.(district);

      // 드롭다운 닫기
      setIsDistrictOpen(false);
    },
    [onDistrictChange],
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-4">
        {/* 시/도 드롭다운 */}
        <div className="flex-1 relative">
          <button
            onClick={() => setIsCityOpen(!isCityOpen)}
            className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
          >
            <span className={selectedCity ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCity || placeholder.city}
            </span>
            <i className={`ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform ${
              isCityOpen ? 'rotate-180' : ''
            }`}></i>
          </button>
          
          {isCityOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                    selectedCity === city
                      ? 'bg-brand-light text-brand-deepest'
                      : 'text-gray-700'
                  }`}
                >
                  {getSimpleName(city)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 시/군/구 드롭다운 */}
        <div className="flex-1 relative">
          <button
            onClick={() => setIsDistrictOpen(!isDistrictOpen)}
            disabled={!selectedCity || districts.length === 0}
            className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-white transition-colors ${
              !selectedCity || districts.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary'
            }`}
          >
            <span className={selectedDistrict ? 'text-gray-900' : 'text-gray-500'}>
              {!selectedCity
                ? placeholder.city
                : districts.length === 0
                ? `${getSimpleName(selectedCity)}는 별도의 구/군 구분이 없습니다`
                : selectedDistrict || placeholder.district
              }
            </span>
            {selectedCity && districts.length > 0 && (
              <i className={`ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform ${
                isDistrictOpen ? 'rotate-180' : ''
              }`}></i>
            )}
          </button>
          
          {isDistrictOpen && selectedCity && districts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {districts.map(district => (
                <button
                  key={district}
                  onClick={() => handleDistrictChange(district)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                    selectedDistrict === district
                      ? 'bg-brand-light text-brand-deepest'
                      : 'text-gray-700'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
