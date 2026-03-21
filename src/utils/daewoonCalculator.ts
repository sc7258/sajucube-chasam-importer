/**
 * 대운 계산 모듈
 */

import { ganji, solortoso24 } from './calculationModule';

export interface Daewoon {
  age: number;
  gan: string;
  ji: string;
}

/**
 * 대운 계산
 * @param year 생년
 * @param month 생월
 * @param day 생일
 * @param hour 생시
 * @param minute 생분
 * @param gender 성별 ('male' | 'female')
 * @param yearGan 연간 (예: '甲')
 * @param monthPillarIndex 월주의 60갑자 인덱스
 * @returns 대운 배열 (12개, 10년 단위)
 */
export function calculateDaewoon(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female',
  yearGan: string,
  monthPillarIndex: number
): { daewoonList: Daewoon[], firstAge: number } {
  // 1. 양남음녀 순행, 음남양녀 역행 결정
  const yangGans = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGans.includes(yearGan);
  const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  // 2. 절기 정보 가져오기
  const solarTermData = solortoso24(year, month, day, hour, minute);
  
  // 3. 다음/이전 절기까지 일수 계산
  let daysToNextTerm: number;
  
  if (isForward) {
    // 순행: 다음 절기까지
    const outgiDate = new Date(
      solarTermData.outgiyear,
      solarTermData.outgimonth - 1,
      solarTermData.outgiday,
      solarTermData.outgihour,
      solarTermData.outgimin
    );
    const birthDate = new Date(year, month - 1, day, hour, minute);
    daysToNextTerm = Math.ceil((outgiDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // 역행: 이전 절기까지
    const ingiDate = new Date(
      solarTermData.ingiyear,
      solarTermData.ingimonth - 1,
      solarTermData.ingiday,
      solarTermData.ingihour,
      solarTermData.ingimin
    );
    const birthDate = new Date(year, month - 1, day, hour, minute);
    daysToNextTerm = Math.ceil((birthDate.getTime() - ingiDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // 음수 방지
  if (daysToNextTerm < 0) daysToNextTerm = Math.abs(daysToNextTerm);
  
  // 4. 첫 대운 시작 나이: 일수 ÷ 3 (반올림)
  const firstAge = Math.round(daysToNextTerm / 3);

  // 5. 대운 배열 생성 (10년 단위, 12개)
  const daewoonList: Daewoon[] = [];
  let currentIndex = monthPillarIndex;
  let currentAge = firstAge;

  for (let i = 0; i < 12; i++) {
    // 순행/역행에 따라 인덱스 이동
    if (isForward) {
      currentIndex = (currentIndex + 1) % 60;
    } else {
      currentIndex = (currentIndex - 1 + 60) % 60;
    }

    const ganjiStr = ganji[currentIndex];
    daewoonList.push({
      age: currentAge,
      gan: ganjiStr[0],
      ji: ganjiStr[1],
    });

    currentAge += 10;
  }

  return { daewoonList, firstAge };
}

/**
 * 세운 계산 (특정 대운의 10년치 연도)
 * @param birthYear 생년
 * @param daewoonAge 대운 시작 나이
 * @returns 해당 대운의 10년치 세운 배열
 */
export function calculateSaewoonForDaewoon(
  birthYear: number,
  daewoonAge: number
): Array<{ year: number; ganji: string }> {
  const saewoonList = [];
  
  // 대운 X세일 때, 세운은 (출생년도 + X - 1)년부터 시작
  // 예: 2001년생, 10세 대운 -> 2010년부터 시작 (2010년에 10세가 됨)
  const startYear = birthYear + daewoonAge - 1;
  
  for (let i = 0; i < 10; i++) {
    const targetYear = startYear + i;
    const ganji = calculateYearGanji(targetYear);
    
    saewoonList.push({
      year: targetYear,
      ganji,
    });
  }
  
  return saewoonList;
}

/**
 * 특정 연도의 간지 계산
 * @param year 연도
 * @returns 간지 (예: '甲子')
 */
function calculateYearGanji(year: number): string {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 서기 4년 = 甲子년
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  
  return stems[stemIndex] + branches[branchIndex];
}