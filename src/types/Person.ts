export interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female';
  occupation?: string;
  deathReason?: string;
  keywords?: string; // ⭐ 추가: 키워드 (쉼표로 구분)
  birthDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isLunar: boolean;
    isLeapMonth: boolean;
    monthPillar?: string; // 본원의 월주 (미리 계산해서 저장)
    dayPillar?: string; // 본원의 일주 (미리 계산해서 저장)
  };
  birthPlace?: string;
  familyMemberIds?: string[];
  notes?: string;
  referenceLinks?: string[]; // 관련 링크 3개
  additionalDates?: Array<{
    year: number;
    month: number;
    day: number;
    label: string;
    monthPillar?: string; // 월주 (미리 계산해서 저장)
    dayPillar?: string; // 일주 (미리 계산해서 저장)
  }>;
  relationships?: {
    parents?: string[]; // 부모의 ID 목록
    spouse?: string[]; // 배우자의 ID 목록
    partners?: string[]; // 교제자의 ID 목록
    children?: string[]; // 자녀의 ID 목록
    siblings?: string[]; // 형제자매의 ID 목록
  };
  createdAt: string;
  createdBy: string;             // ⭐ 필수: 생성한 사용자 ID
  createdByNickname?: string;    // 선택: 생성자 닉네임 (참고용)
  isPrivate?: boolean;           // ⭐ Private 모드 (기본값: false = Public)
}

export interface CalculationResult {
  personId: string;
  // 계산 결과 데이터 - 추후 구체적인 필드 추가
  solarCalendar: string;
  lunarCalendar?: string;
  solarTerm?: string; // 절기
  calculatedData?: Record<string, any>; // 계산된 사주 데이터
  calculatedAt: string;
}