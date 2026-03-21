/**
 * 차샘 만세력 DB → MinimalPersonData 변환 모듈
 * specs/02-converter-module.md 참조
 */

import { lunartosolar, sydtoso24yd, ganji } from '@/utils/calculationModule'
import { calculateAutoDates } from '@/utils/dateCalculation'

// 60갑자 한자 → 한글 매핑
export const GANJI_HANJA_TO_HANGUL: Record<string, string> = {
  '甲子': '갑자', '乙丑': '을축', '丙寅': '병인', '丁卯': '정묘', '戊辰': '무진',
  '己巳': '기사', '庚午': '경오', '辛未': '신미', '壬申': '임신', '癸酉': '계유',
  '甲戌': '갑술', '乙亥': '을해', '丙子': '병자', '丁丑': '정축', '戊寅': '무인',
  '己卯': '기묘', '庚辰': '경진', '辛巳': '신사', '壬午': '임오', '癸未': '계미',
  '甲申': '갑신', '乙酉': '을유', '丙戌': '병술', '丁亥': '정해', '戊子': '무자',
  '己丑': '기축', '庚寅': '경인', '辛卯': '신묘', '壬辰': '임진', '癸巳': '계사',
  '甲午': '갑오', '乙未': '을미', '丙申': '병신', '丁酉': '정유', '戊戌': '무술',
  '己亥': '기해', '庚子': '경자', '辛丑': '신축', '壬寅': '임인', '癸卯': '계묘',
  '甲辰': '갑진', '乙巳': '을사', '丙午': '병오', '丁未': '정미', '戊申': '무신',
  '己酉': '기유', '庚戌': '경술', '辛亥': '신해', '壬子': '임자', '癸丑': '계축',
  '甲寅': '갑인', '乙卯': '을묘', '丙辰': '병진', '丁巳': '정사', '戊午': '무오',
  '己未': '기미', '庚申': '경신', '辛酉': '신유', '壬戌': '임술', '癸亥': '계해',
}

export interface ChasamRecord {
  id: string
  sex: 'M' | 'F'
  name: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthdayType: 'S' | 'L' | 'N'
  birthHour: number
  birthMinute: number
  birthDateTime: string
  memo: string
  ilju: string
  iljuHanja: string
}

export interface ConversionResult {
  data: MinimalPersonData
  warnings: string[]
  iljuValid: boolean
  originalIlju: string
  calculatedIlju: string
  status: 'ok' | 'warning' | 'error'
}

export interface BatchConversionResult {
  results: ConversionResult[]
  totalCount: number
  okCount: number
  warningCount: number
  errorCount: number
}

// MinimalPersonData (saju-cube 동일 구조)
export interface MinimalPersonData {
  id: string
  createdAt: Date
  updatedAt?: Date
  createdBy: string
  createdByNickname?: string
  name: string
  gender: 'male' | 'female'
  birthDate: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    isLunar?: boolean
    isLeapMonth?: boolean
  }
  birthPlace?: string
  occupation?: string
  deathReason?: string
  notes?: string
  additionalDates: Array<{
    label: string
    year: number
    month: number
    day: number
  }>
}

export interface PairGroup {
  key: string
  sRecord?: ChasamRecord
  lRecord?: ChasamRecord
  isSingleS: boolean
  isSingleL: boolean
  isPair: boolean
}

// ────────────────────────────────────────────────

/**
 * JSON 문자열을 파싱해 ChasamRecord[] 반환
 */
export function parseChasamJson(jsonText: string): ChasamRecord[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('유효하지 않은 JSON 파일입니다')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('JSON 최상위가 배열이어야 합니다')
  }
  const REQUIRED = ['id', 'name', 'sex', 'birthYear', 'birthMonth', 'birthDay']
  const valid: ChasamRecord[] = []
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue
    const missing = REQUIRED.filter(f => !(f in (item as object)))
    if (missing.length > 0) { console.warn(`레코드 건너뜀 (누락: ${missing.join(', ')})`); continue }
    valid.push(item as ChasamRecord)
  }
  return valid
}

/**
 * 일주 검증: 계산 결과와 차샘 원본 ilju 비교
 */
export function validateIlju(
  year: number, month: number, day: number,
  hour: number, minute: number,
  expectedIlju: string
): { valid: boolean; calculatedIlju: string } {
  try {
    const result = sydtoso24yd(year, month, day, hour, minute)
    const hanjaIlju = ganji[result.so24day]
    const calculatedIlju = GANJI_HANJA_TO_HANGUL[hanjaIlju] ?? hanjaIlju
    return { valid: calculatedIlju === expectedIlju, calculatedIlju }
  } catch {
    return { valid: false, calculatedIlju: '계산 오류' }
  }
}

/**
 * MinimalPersonData 조합 헬퍼
 */
function buildData(
  record: ChasamRecord,
  year: number, month: number, day: number,
  isLunar: boolean, createdBy: string,
  additionalDates: MinimalPersonData['additionalDates'],
  notes?: string
): MinimalPersonData {
  return {
    id: record.id,
    createdAt: new Date(),
    createdBy,
    name: record.name,
    gender: record.sex === 'M' ? 'male' : 'female',
    birthDate: { year, month, day, hour: record.birthHour, minute: record.birthMinute, isLunar, isLeapMonth: false },
    notes,
    additionalDates,
  }
}

/**
 * ChasamRecord 1건을 변환
 */
export function convertRecord(record: ChasamRecord, createdBy: string): ConversionResult {
  const warnings: string[] = []
  let birthYear = record.birthYear
  let birthMonth = record.birthMonth
  let birthDay = record.birthDay
  let isLunar = false

  if (record.birthdayType === 'L') {
    isLunar = true
    try {
      const solar = lunartosolar(record.birthYear, record.birthMonth, record.birthDay, 0)
      birthYear = solar.syear; birthMonth = solar.smonth; birthDay = solar.sday
    } catch {
      warnings.push(`[${record.name}] 음력→양력 변환 실패: ${record.birthYear}.${record.birthMonth}.${record.birthDay}`)
      return {
        data: buildData(record, record.birthYear, record.birthMonth, record.birthDay, isLunar, createdBy, [], record.memo.trim() || undefined),
        warnings, iljuValid: false, originalIlju: record.ilju, calculatedIlju: '변환 실패', status: 'error',
      }
    }
  } else if (record.birthdayType === 'N') {
    warnings.push(`[${record.name}] birthdayType 'N' 감지 — 양력으로 처리됨, 수동 확인 필요`)
  }

  const dateCalcResult = calculateAutoDates(birthYear, birthMonth, birthDay)
  if (!dateCalcResult.success || !dateCalcResult.dates) {
    warnings.push(`[${record.name}] 6개 명식 날짜 계산 실패: ${dateCalcResult.error ?? ''}`)
    return {
      data: buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy, [], record.memo.trim() || undefined),
      warnings, iljuValid: false, originalIlju: record.ilju, calculatedIlju: '계산 실패', status: 'error',
    }
  }

  const additionalDates = dateCalcResult.dates.map(d => ({ label: d.label, year: d.year, month: d.month, day: d.day }))
  const notes = record.memo.trim() !== '' ? record.memo.trim() : undefined
  const data = buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy, additionalDates, notes)

  const { valid: iljuValid, calculatedIlju } = validateIlju(
    birthYear, birthMonth, birthDay, record.birthHour, record.birthMinute, record.ilju
  )
  if (!iljuValid) {
    warnings.push(`[${record.name}] 일주 불일치 — 원본: "${record.ilju}", 계산값: "${calculatedIlju}" (윤달 여부 확인)`)
  }

  return { data, warnings, iljuValid, originalIlju: record.ilju, calculatedIlju, status: warnings.length > 0 ? 'warning' : 'ok' }
}

/**
 * 여러 레코드 배치 변환
 */
export function convertBatch(records: ChasamRecord[], createdBy: string): BatchConversionResult {
  const results = records.map(r => convertRecord(r, createdBy))
  return {
    results,
    totalCount: results.length,
    okCount: results.filter(r => r.status === 'ok').length,
    warningCount: results.filter(r => r.status === 'warning').length,
    errorCount: results.filter(r => r.status === 'error').length,
  }
}

/**
 * S/L 쌍 레코드 감지 (이름 suffix 패턴 기반)
 */
export function detectPairs(records: ChasamRecord[]): PairGroup[] {
  const normalize = (name: string) => name.replace(/[+\-2]$/, '').trim()
  const groups: Record<string, { s?: ChasamRecord; l?: ChasamRecord }> = {}
  for (const rec of records) {
    const key = normalize(rec.name)
    if (!groups[key]) groups[key] = {}
    if (rec.birthdayType === 'S' && !groups[key].s) groups[key].s = rec
    else if (rec.birthdayType === 'L' && !groups[key].l) groups[key].l = rec
  }
  return Object.entries(groups).map(([key, { s, l }]) => ({
    key, sRecord: s, lRecord: l,
    isSingleS: !!s && !l, isSingleL: !s && !!l, isPair: !!s && !!l,
  }))
}
