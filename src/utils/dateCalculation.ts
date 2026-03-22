/**
 * 사주 큐브 날짜 계산 유틸리티
 * 
 * 본원 기준으로 6개 날짜를 자동 계산하는 로직을 포함합니다:
 * - 본원-2, 본원-1, 본원, 본원+1, 본원+2, 본원+3
 * 
 * 음력/양력 변환 및 중복 검증을 수행합니다.
 */

import { solortolunar, lunartosolar } from '@/utils/calculationModule';

export interface SelectedDate {
  year: number;
  month: number;
  day: number;
  label: string; // '본원', '본원-1', '본원-2', '본원+1', '본원+2', '본원+3'
}

export interface DateCalculationResult {
  success: boolean;
  dates?: SelectedDate[];
  error?: string;
}

/**
 * 날짜가 실제로 존재하는지 검증합니다.
 * JavaScript Date가 자동으로 보정하는 것을 방지합니다.
 * 
 * @example
 * isValidDate(1999, 2, 29) // false (1999년은 윤년 아님)
 * isValidDate(2000, 2, 29) // true (2000년은 윤년)
 * isValidDate(2024, 4, 31) // false (4월은 30일까지)
 */
function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * 음력 year/month/day를 양력으로 변환. 해당 날이 없으면(소월 등) 같은 달에서
 * day를 1씩 내려가며 유효한 마지막 날을 반환. 해당 달 전체가 없으면 null.
 */
function tryLunarToSolar(year: number, month: number, day: number): { syear: number; smonth: number; sday: number } | null {
  for (let d = day; d >= 1; d--) {
    try {
      const result = lunartosolar(year, month, d, 0);
      const verify = solortolunar(result.syear, result.smonth, result.sday);
      if (verify.lyear === year && verify.lmonth === month && verify.lday === d) {
        return { syear: result.syear, smonth: result.smonth, sday: result.sday };
      }
    } catch {}
  }
  return null;
}

/**
 * 본원 기준으로 6개 날짜를 자동 계산합니다.
 * 
 * @param baseYear - 본원 연도
 * @param baseMonth - 본원 월
 * @param baseDay - 본원 일
 * @returns 계산 결과 (성공 여부, 날짜 배열, 에러 메시지)
 * 
 * @example
 * const result = calculateAutoDates(2024, 1, 1);
 * if (result.success && result.dates) {
 *   console.log('6개 날짜 계산 완료:', result.dates);
 * } else {
 *   console.error('계산 실패:', result.error);
 * }
 */
export function calculateAutoDates(
  baseYear: number,
  baseMonth: number,
  baseDay: number
): DateCalculationResult {
  try {
    const dates: SelectedDate[] = [];
    const errors: string[] = [];

    // 본원
    const base = { year: baseYear, month: baseMonth, day: baseDay };
    dates.push({ ...base, label: '본원' });

    // 본원의 음력
    const baseLunar = solortolunar(base.year, base.month, base.day);

    // === 본원-1, 본원-2 계산 (독립적) ===
    let minus1Success = false;
    let minus2Success = false;

    // 본원-1: 음력 년월일을 그대로 양력 숫자로 사용 (윤달이어도 그대로 사용)
    {
      const minus1 = {
        year: baseLunar.lyear,
        month: baseLunar.lmonth,
        day: baseLunar.lday,
        label: '본원-1'
      };
      
      // 날짜 유효성 검증
      if (!isValidDate(minus1.year, minus1.month, minus1.day)) {
        errors.push(`${minus1.year}년 ${minus1.month}월 ${minus1.day}일은 존재하지 않는 날짜입니다.`);
      }
      // 본원과 중복 체크
      else if (minus1.year === base.year && minus1.month === base.month && minus1.day === base.day) {
        errors.push('본원과 동일한 날짜입니다.');
      } else {
        dates.push(minus1);
        minus1Success = true;

        // 본원-2: 본원-1을 음력으로 변환한 값을 양력 숫자로 사용 (윤달이어도 그대로 사용)
        try {
          const minus1Lunar = solortolunar(minus1.year, minus1.month, minus1.day);
          const minus2 = {
            year: minus1Lunar.lyear,
            month: minus1Lunar.lmonth,
            day: minus1Lunar.lday,
            label: '본원-2'
          };
          
          // 날짜 유효성 검증
          if (!isValidDate(minus2.year, minus2.month, minus2.day)) {
            errors.push(`${minus2.year}년 ${minus2.month}월 ${minus2.day}일은 존재하지 않는 날짜입니다.`);
          }
          // 기존 날짜들과 중복 체크
          else if (dates.some(d => d.year === minus2.year && d.month === minus2.month && d.day === minus2.day)) {
            errors.push('기존 날짜와 중복됩니다.');
          } else {
            dates.push(minus2);
            minus2Success = true;
          }
        } catch (e) {
          errors.push('날짜가 유효하지 않습니다.');
        }
      }
    }

    // === 본원+1, 본원+2, 본원+3 계산 (독립적) ===
    let plus1Success = false;
    let plus2Success = false;
    let plus3Success = false;

    // 본원+1: 원 양력을 음력으로 해석 → 양력으로 변환 (음력에 없는 날이면 같은 달 마지막 유효일로 내림)
    const plus1Solar = tryLunarToSolar(base.year, base.month, base.day);
    if (!plus1Solar) {
      errors.push(`음력 ${base.year}년 ${base.month}월 유효한 날짜를 찾을 수 없습니다.`);
    } else {
      const plus1 = { year: plus1Solar.syear, month: plus1Solar.smonth, day: plus1Solar.sday, label: '본원+1' };
      const isDuplicate = dates.some(d => d.year === plus1.year && d.month === plus1.month && d.day === plus1.day);
      if (!isDuplicate) {
        dates.push(plus1);
        plus1Success = true;

        // 본원+2: 본원+1 양력을 음력으로 해석 → 양력으로 재변환
        const plus2Solar = tryLunarToSolar(plus1Solar.syear, plus1Solar.smonth, plus1Solar.sday);
        if (!plus2Solar) {
          errors.push(`음력 ${plus1Solar.syear}년 ${plus1Solar.smonth}월 유효한 날짜를 찾을 수 없습니다.`);
        } else {
          const plus2 = { year: plus2Solar.syear, month: plus2Solar.smonth, day: plus2Solar.sday, label: '본원+2' };
          const isDuplicate2 = dates.some(d => d.year === plus2.year && d.month === plus2.month && d.day === plus2.day);
          if (!isDuplicate2) {
            dates.push(plus2);
            plus2Success = true;

            // 본원+3: 본원+2 양력을 음력으로 해석 → 양력으로 재변환
            const plus3Solar = tryLunarToSolar(plus2Solar.syear, plus2Solar.smonth, plus2Solar.sday);
            if (!plus3Solar) {
              errors.push(`음력 ${plus2Solar.syear}년 ${plus2Solar.smonth}월 유효한 날짜를 찾을 수 없습니다.`);
            } else {
              const plus3 = { year: plus3Solar.syear, month: plus3Solar.smonth, day: plus3Solar.sday, label: '본원+3' };
              const isDuplicate3 = dates.some(d => d.year === plus3.year && d.month === plus3.month && d.day === plus3.day);
              if (!isDuplicate3) {
                dates.push(plus3);
                plus3Success = true;
              } else {
                errors.push('기존 날짜와 중복됩니다.');
              }
            }
          } else {
            errors.push('기존 날짜와 중복됩니다.');
          }
        }
      } else {
        errors.push('기존 날짜와 중복됩니다.');
      }
    }

    // 결과 판단
    if (dates.length === 6) {
      // 모두 성공
      return { success: true, dates };
    } else {
      // 부분 성공
      const errorMessage = errors.length > 0 ? errors.join(' / ') : '일부 날짜 계산 실패';
      return {
        success: false,
        dates,
        error: errorMessage
      };
    }
  } catch (e) {
    return {
      success: false,
      error: '자동 계산 중 오류가 발생했습니다.'
    };
  }
}