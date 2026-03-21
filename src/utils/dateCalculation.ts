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

    // 본원-1: 음력 년월일을 그대로 양력 숫자로 사용
    if (baseLunar.lmoonyun === 1) {
      errors.push(`음력 윤${baseLunar.lmonth}월 ${baseLunar.lday}일은 양력으로 표현할 수 없습니다.`);
    } else {
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

        // 본원-2: 본원-1을 음력으로 변환한 값을 양력 숫자로 사용
        try {
          const minus1Lunar = solortolunar(minus1.year, minus1.month, minus1.day);
          
          if (minus1Lunar.lmoonyun === 1) {
            errors.push(`음력 윤${minus1Lunar.lmonth}월 ${minus1Lunar.lday}일은 양력으로 표현할 수 없습니다.`);
          } else {
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

    // 본원+1: 원 양력을 음력으로 해석 → 양력으로 변환
    try {
      const plus1Solar = lunartosolar(base.year, base.month, base.day, 0);
      
      // 결과 검증
      const verification = solortolunar(plus1Solar.syear, plus1Solar.smonth, plus1Solar.sday);
      if (verification.lyear !== base.year || verification.lmonth !== base.month || verification.lday !== base.day) {
        errors.push(`음력 ${base.year}년 ${base.month}월 ${base.day}일이 존재하지 않습니다.`);
      } else {
        const plus1 = {
          year: plus1Solar.syear,
          month: plus1Solar.smonth,
          day: plus1Solar.sday,
          label: '본원+1'
        };
        
        // 기존 날짜들과 중복 체크
        const isDuplicate = dates.some(d => 
          d.year === plus1.year && d.month === plus1.month && d.day === plus1.day
        );
        
        if (!isDuplicate) {
          dates.push(plus1);
          plus1Success = true;

          // 본원+2: 본원+1 양력을 음력으로 해석 → 양력으로 재변환
          try {
            const plus2Solar = lunartosolar(plus1Solar.syear, plus1Solar.smonth, plus1Solar.sday, 0);
            
            const verification2 = solortolunar(plus2Solar.syear, plus2Solar.smonth, plus2Solar.sday);
            if (verification2.lyear !== plus1Solar.syear || verification2.lmonth !== plus1Solar.smonth || verification2.lday !== plus1Solar.sday) {
              errors.push(`음력 ${plus1Solar.syear}년 ${plus1Solar.smonth}월 ${plus1Solar.sday}일이 존재하지 않습니다.`);
            } else {
              const plus2 = {
                year: plus2Solar.syear,
                month: plus2Solar.smonth,
                day: plus2Solar.sday,
                label: '본원+2'
              };
              
              // 기존 날짜들과 중복 체크
              const isDuplicate2 = dates.some(d => 
                d.year === plus2.year && d.month === plus2.month && d.day === plus2.day
              );
              
              if (!isDuplicate2) {
                dates.push(plus2);
                plus2Success = true;

                // 본원+3: 본원+2 양력을 음력으로 해석 → 양력으로 재변환
                try {
                  const plus3Solar = lunartosolar(plus2Solar.syear, plus2Solar.smonth, plus2Solar.sday, 0);
                  
                  const verification3 = solortolunar(plus3Solar.syear, plus3Solar.smonth, plus3Solar.sday);
                  if (verification3.lyear !== plus2Solar.syear || verification3.lmonth !== plus2Solar.smonth || verification3.lday !== plus2Solar.sday) {
                    errors.push(`음력 ${plus2Solar.syear}년 ${plus2Solar.smonth}월 ${plus2Solar.sday}일이 존재하지 않습니다.`);
                  } else {
                    const plus3 = {
                      year: plus3Solar.syear,
                      month: plus3Solar.smonth,
                      day: plus3Solar.sday,
                      label: '본원+3'
                    };
                    
                    // 기존 날짜들과 중복 체크
                    const isDuplicate3 = dates.some(d => 
                      d.year === plus3.year && d.month === plus3.month && d.day === plus3.day
                    );
                    
                    if (!isDuplicate3) {
                      dates.push(plus3);
                      plus3Success = true;
                    } else {
                      errors.push('기존 날짜와 중복됩니다.');
                    }
                  }
                } catch (e) {
                  errors.push('날짜가 유효하지 않습니다.');
                }
              } else {
                errors.push('기존 날짜와 중복됩니다.');
              }
            }
          } catch (e) {
            errors.push('날짜가 유효하지 않습니다.');
          }
        } else {
          errors.push('기존 날짜와 중복됩니다.');
        }
      }
    } catch (e) {
      errors.push('날짜가 유효하지 않습니다.');
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