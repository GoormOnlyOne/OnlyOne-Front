// 관심사 정보 타입 정의
export interface InterestInfo {
  label: string;
  icon: string;
  activeIcon: string;
  bgColor: string;
  textColor: string;
}

// 관심사 영어 키워드를 한글과 스타일 정보로 매핑
export const INTEREST_DATA: Record<string, InterestInfo> = {
  // 대문자 형태
  'CULTURE': {
    label: '문화',
    icon: 'ri-palette-line',
    activeIcon: 'ri-palette-fill',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  'EXERCISE': {
    label: '운동',
    icon: 'ri-run-line', 
    activeIcon: 'ri-run-fill',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  'TRAVEL': {
    label: '여행',
    icon: 'ri-plane-line',
    activeIcon: 'ri-plane-fill',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  'MUSIC': {
    label: '음악',
    icon: 'ri-music-2-line',
    activeIcon: 'ri-music-2-fill',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
  },
  'CRAFT': {
    label: '공예',
    icon: 'ri-scissors-cut-line',
    activeIcon: 'ri-scissors-cut-fill',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  'SOCIAL': {
    label: '사교',
    icon: 'ri-team-line',
    activeIcon: 'ri-team-fill',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  'LANGUAGE': {
    label: '외국어',
    icon: 'ri-translate-2',
    activeIcon: 'ri-translate',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
  'FINANCE': {
    label: '재테크',
    icon: 'ri-money-dollar-circle-line',
    activeIcon: 'ri-money-dollar-circle-fill',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  
  // 소문자 형태 (백엔드에서 소문자로 올 수도 있음)
  'culture': {
    label: '문화',
    icon: 'ri-palette-line',
    activeIcon: 'ri-palette-fill',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  'exercise': {
    label: '운동',
    icon: 'ri-run-line',
    activeIcon: 'ri-run-fill',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  'travel': {
    label: '여행',
    icon: 'ri-plane-line',
    activeIcon: 'ri-plane-fill',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  'music': {
    label: '음악',
    icon: 'ri-music-2-line',
    activeIcon: 'ri-music-2-fill',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
  },
  'craft': {
    label: '공예',
    icon: 'ri-scissors-cut-line',
    activeIcon: 'ri-scissors-cut-fill',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  'social': {
    label: '사교',
    icon: 'ri-team-line',
    activeIcon: 'ri-team-fill',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  'language': {
    label: '외국어',
    icon: 'ri-translate-2',
    activeIcon: 'ri-translate',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
  'finance': {
    label: '재테크',
    icon: 'ri-money-dollar-circle-line',
    activeIcon: 'ri-money-dollar-circle-fill',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
};

// 하위 호환성을 위한 기존 함수들
export const INTEREST_TRANSLATIONS: Record<string, string> = Object.fromEntries(
  Object.entries(INTEREST_DATA).map(([key, value]) => [key, value.label])
);

/**
 * 영어 관심사 키워드를 한글로 변환
 * @param englishKeyword - 변환할 영어 키워드
 * @returns 한글로 변환된 키워드, 매핑되지 않은 경우 원본 반환
 */
export const translateInterest = (englishKeyword: string): string => {
  return INTEREST_TRANSLATIONS[englishKeyword] || englishKeyword;
};

/**
 * 영어 관심사 키워드 배열을 한글 배열로 변환
 * @param englishKeywords - 변환할 영어 키워드 배열
 * @returns 한글로 변환된 키워드 배열
 */
export const translateInterests = (englishKeywords: string[]): string[] => {
  return englishKeywords.map(keyword => translateInterest(keyword));
};

/**
 * 영어 관심사 키워드의 정보를 가져오는 함수
 * @param englishKeyword - 변환할 영어 키워드
 * @returns 관심사 정보 객체, 매핑되지 않은 경우 기본 정보 반환
 */
export const getInterestInfo = (englishKeyword: string): InterestInfo => {
  return INTEREST_DATA[englishKeyword] || {
    label: englishKeyword,
    icon: 'ri-hashtag',
    activeIcon: 'ri-hashtag',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  };
};

/**
 * 영어 관심사 키워드 배열을 정보 객체 배열로 변환
 * @param englishKeywords - 변환할 영어 키워드 배열
 * @returns 관심사 정보 객체 배열
 */
export const getInterestsInfo = (englishKeywords: string[]): InterestInfo[] => {
  return englishKeywords.map(keyword => getInterestInfo(keyword));
};