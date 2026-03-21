/**
 * 월운(月運) 계산 유틸리티
 * 연상기월법(年上起月法) / 오월정월법(五月正月法)
 */

import { sydtoso24yd, ganji } from './calculationModule';

/**
 * 특정 년/월의 간지를 계산 (절기 기준)
 */
export const getMonthGanji = (year: number, month: number): string => {
  try {
    const sajuData = sydtoso24yd(year, month, 15, 12, 0);
    return ganji[sajuData.so24month];
  } catch (e) {
    return '-';
  }
};

/**
 * 특정 연도의 12개월 간지 배열 반환
 * @param year - 연도 (예: 2026)
 * @returns 1월부터 12월까지의 간지 배열
 */
export const getYearMonthGanjis = (year: number): string[] => {
  return Array.from({ length: 12 }, (_, i) => getMonthGanji(year, i + 1));
};
