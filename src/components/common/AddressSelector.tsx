import React, { useState, useCallback, useEffect } from 'react';
import KoreaData from "../../assets/json/korea_administrative_divisions.json";

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
  className = "",
  initialCity = "",
  initialDistrict = "",
  placeholder = {
    city: "시/도를 선택하세요",
    district: "시/군/구를 선택하세요"
  }
}) => {
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);

  const cities = Object.keys(typedKoreaData.korea_administrative_divisions);
  const districts = selectedCity ? typedKoreaData.korea_administrative_divisions[selectedCity]?.districts || [] : [];

  // 주소 선택 완료 여부
  const isComplete = useCallback(() => {
    if (!selectedCity) return false;

    // 선택된 시/도에 구/군이 있는 경우 구/군도 선택되어야함
    if (districts.length > 0) {
      return selectedDistrict !== "";
    }

    // 구/군이 없는 경우 (세종)
    return true;
  }, [selectedCity, selectedDistrict, districts.length]);

  // 주소 변경 시 완료 상태와 함께 콜백 호출
  useEffect(() => {
    const addressData: AddressData = {
      city: selectedCity,
      district: selectedDistrict,
      isComplete: isComplete()
    };
    onAddressChange?.(addressData);
  }, [selectedCity, selectedDistrict, isComplete]);
  // 간단한 이름 변환 함수 (이미 간소화된 이름이므로 그대로 반환)
  const getSimpleName = useCallback((name: string) => {
    return name;
  }, []);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);

		// 새로 선택된 시/도의 구/군 목록 가져오기
		const newDistricts = typedKoreaData.korea_administrative_divisions[city]?.districts || [];

		const firstDistrict = newDistricts.length > 0 ? newDistricts[0] : "";
    setSelectedDistrict(firstDistrict);

    // 콜백 호출
    onCityChange?.(city);
		if(firstDistrict) {
			onDistrictChange?.(firstDistrict);
		}

  }, [onCityChange, onDistrictChange]);

  const handleDistrictChange = useCallback((district: string) => {
    setSelectedDistrict(district);

    // 콜백 호출
    onDistrictChange?.(district);
  }, [onDistrictChange]);

  return (
    <div className={`w-full max-w-4xl mx-auto border border-gray-300 ${className}`}>
      {/* 모든 화면에서 좌우 분할 */}
      <div className="flex h-80 sm:h-96">
        {/* 좌측: 시/도 선택 */}
        <div className="w-2/5 sm:w-1/3 border-r border-gray-300 bg-gray-50">
          <div className="overflow-y-auto h-full">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => handleCityChange(city)}
                className={`w-full text-left px-2 sm:px-3 md:px-4 py-2 md:py-3 hover:bg-gray-100 border-b border-gray-200 transition-colors text-xs sm:text-sm md:text-base ${selectedCity === city
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-r-blue-500'
                    : 'text-gray-700'
                  }`}
              >
                {getSimpleName(city)}
              </button>
            ))}
          </div>
        </div>

        {/* 우측: 구/군 선택 */}
        <div className="w-3/5 sm:w-2/3 bg-white">
          <div className="overflow-y-auto h-full">
            {!selectedCity ? (
              <div className="flex items-center justify-center h-20 md:h-32 text-gray-500 text-xs sm:text-sm md:text-base px-2 text-center">
                {placeholder.city}
              </div>
            ) : districts.length === 0 ? (
              <div className="flex items-center justify-center h-20 md:h-32 text-gray-500 text-xs sm:text-sm md:text-base px-2 text-center leading-tight">
                {getSimpleName(selectedCity)}는 별도의 구/군 구분이 없습니다
              </div>
            ) : (
              districts.map((district) => (
                <button
                  key={district}
                  onClick={() => handleDistrictChange(district)}
                  className={`w-full text-left px-2 sm:px-3 md:px-4 py-2 md:py-3 hover:bg-gray-100 border-b border-gray-200 transition-colors text-xs sm:text-sm md:text-base ${selectedDistrict === district
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                    }`}
                >
                  {district}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;