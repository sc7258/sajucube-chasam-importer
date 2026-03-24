/**
 * 차샘 만세력 DB → MinimalPersonData 변환 모듈
 * specs/02-converter-module.md 참조
 */

import { lunartosolar, solortolunar, sydtoso24yd, ganji } from '@/utils/calculationModule'
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
  const normalizedText = jsonText.replace(/^\uFEFF/, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(normalizedText)
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
  notes?: string,
  isLeapMonth = false
): MinimalPersonData {
  return {
    id: record.id,
    createdAt: new Date(),
    createdBy,
    name: record.name,
    gender: record.sex === 'M' ? 'male' : 'female',
    birthDate: { year, month, day, hour: record.birthHour, minute: record.birthMinute, isLunar, isLeapMonth },
    notes,
    additionalDates,
  }
}

interface LunarCandidate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  iljuValid: boolean
  calculatedIlju: string
}

function inferLunarSolarCandidate(record: ChasamRecord): { candidate?: LunarCandidate; warning?: string } {
  const candidates: LunarCandidate[] = []

  for (const isLeapMonth of [false, true]) {
    try {
      const solar = lunartosolar(record.birthYear, record.birthMonth, record.birthDay, isLeapMonth ? 1 : 0)
      const { valid, calculatedIlju } = validateIlju(
        solar.syear,
        solar.smonth,
        solar.sday,
        record.birthHour,
        record.birthMinute,
        record.ilju,
      )
      candidates.push({
        year: solar.syear,
        month: solar.smonth,
        day: solar.sday,
        isLeapMonth,
        iljuValid: valid,
        calculatedIlju,
      })
    } catch {
      continue
    }
  }

  if (candidates.length === 0) {
    return {
      warning: `[${record.name}] 음력→양력 변환 실패: ${record.birthYear}.${record.birthMonth}.${record.birthDay}`,
    }
  }

  const uniqueCandidates = candidates.filter((candidate, index, all) =>
    index === all.findIndex(other =>
      other.year === candidate.year &&
      other.month === candidate.month &&
      other.day === candidate.day &&
      other.isLeapMonth === candidate.isLeapMonth,
    )
  )
  const validMatches = uniqueCandidates.filter(candidate => candidate.iljuValid)

  if (validMatches.length === 1) {
    const picked = validMatches[0]
    return {
      candidate: picked,
      warning: picked.isLeapMonth
        ? `[${record.name}] 윤달 후보를 일주 검증으로 추론해 처리됨`
        : undefined,
    }
  }

  if (uniqueCandidates.length === 1) {
    return {
      candidate: uniqueCandidates[0],
      warning: uniqueCandidates[0].isLeapMonth
        ? `[${record.name}] 윤달 후보 1건으로 추론해 처리됨`
        : undefined,
    }
  }

  const nonLeapCandidate = uniqueCandidates.find(candidate => !candidate.isLeapMonth) ?? uniqueCandidates[0]
  return {
    candidate: nonLeapCandidate,
    warning: `[${record.name}] 윤달 여부를 확정할 수 없어 ${nonLeapCandidate.isLeapMonth ? '윤달' : '평달'} 기준으로 처리됨, 수동 확인 필요`,
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
  let isLeapMonth = false
  let iljuValid = false
  let calculatedIlju = '계산 실패'

  if (record.birthdayType === 'L') {
    isLunar = true
    const inferred = inferLunarSolarCandidate(record)
    if (!inferred.candidate) {
      if (inferred.warning) warnings.push(inferred.warning)
      return {
        data: buildData(record, record.birthYear, record.birthMonth, record.birthDay, isLunar, createdBy, [], record.memo.trim() || undefined, false),
        warnings, iljuValid: false, originalIlju: record.ilju, calculatedIlju: '변환 실패', status: 'error',
      }
    }
    birthYear = inferred.candidate.year
    birthMonth = inferred.candidate.month
    birthDay = inferred.candidate.day
    isLeapMonth = inferred.candidate.isLeapMonth
    iljuValid = inferred.candidate.iljuValid
    calculatedIlju = inferred.candidate.calculatedIlju
    if (inferred.warning) warnings.push(inferred.warning)
  } else if (record.birthdayType === 'N') {
    warnings.push(`[${record.name}] birthdayType 'N' 감지 — 양력으로 처리됨, 수동 확인 필요`)
  }

  const dateCalcResult = calculateAutoDates(birthYear, birthMonth, birthDay)
  if (!dateCalcResult.success || !dateCalcResult.dates) {
    warnings.push(`[${record.name}] 6개 명식 날짜 계산 실패: ${dateCalcResult.error ?? ''}`)
    return {
      data: buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy, [], record.memo.trim() || undefined, isLeapMonth),
      warnings, iljuValid: false, originalIlju: record.ilju, calculatedIlju: '계산 실패', status: 'error',
    }
  }

  const additionalDates = dateCalcResult.dates.map(d => ({ label: d.label, year: d.year, month: d.month, day: d.day }))
  const notes = record.memo.trim() !== '' ? record.memo.trim() : undefined
  const data = buildData(record, birthYear, birthMonth, birthDay, isLunar, createdBy, additionalDates, notes, isLeapMonth)

  if (record.birthdayType !== 'L') {
    const iljuCheck = validateIlju(
      birthYear, birthMonth, birthDay, record.birthHour, record.birthMinute, record.ilju
    )
    iljuValid = iljuCheck.valid
    calculatedIlju = iljuCheck.calculatedIlju
  }
  if (!iljuValid) {
    warnings.push(`[${record.name}] 일주 불일치 — 원본: "${record.ilju}", 계산값: "${calculatedIlju}"${record.birthdayType === 'L' ? ' (윤달 여부 확인)' : ''}`)
  }

  return { data, warnings, iljuValid, originalIlju: record.ilju, calculatedIlju, status: warnings.length > 0 ? 'warning' : 'ok' }
}

/**
 * 차샘 variant 접미사 제거 → base name 반환
 * 예: "홍길동++" → "홍길동", "홍길동부허" → "홍길동"
 */
export function stripVariantSuffix(name: string): string {
  return name
    .replace(/(\+\+|\+\-|\-\+|\-\-|[+\-])$/, '')
    .replace(/(부허|본원|정본|허본)$/, '')
    .replace(/[정본허]$/, '')
    .replace(/[123]$/, '')
    .trim()
}

/**
 * variant 중복 감지
 * 조건: base name 동일 AND additionalDates year-month-day 교집합 4개 이상
 * 반환: Map<keepId, variantIds[]>  (keepId = 그룹 내 이름이 가장 짧은 레코드)
 */
export function detectVariants(results: ConversionResult[]): Map<string, string[]> {
  // base name 그룹화
  const groups = new Map<string, ConversionResult[]>()
  for (const r of results) {
    if (r.status === 'error') continue
    const base = stripVariantSuffix(r.data.name)
    if (!groups.has(base)) groups.set(base, [])
    groups.get(base)!.push(r)
  }

  const variantMap = new Map<string, string[]>()

  for (const group of groups.values()) {
    if (group.length < 2) continue

    // 각 레코드의 additionalDates를 key Set으로
    const dateSets = group.map(r => new Set(
      (r.data.additionalDates ?? []).map(d => `${d.year}-${d.month}-${d.day}`)
    ))

    // Union-Find로 교집합 4개 이상인 쌍 그룹화
    const parent = group.map((_, i) => i)
    function find(i: number): number { return parent[i] === i ? i : (parent[i] = find(parent[i])) }
    function union(a: number, b: number) { parent[find(a)] = find(b) }

    // 윤달 여부: 양력 생년월일 → 음력 변환 시 lmoonyun === 1이면 인접 윤달 존재
    const isLeapAdjacent = group.map(r => {
      try { return solortolunar(r.data.birthDate.year, r.data.birthDate.month, r.data.birthDate.day).lmoonyun === 1 } catch { return false }
    })

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        // 둘 중 하나라도 윤달이면 이름만으로 병합 (날짜 계산 오차 무시)
        if (isLeapAdjacent[i] || isLeapAdjacent[j]) { union(i, j); continue }
        let overlap = 0
        for (const key of dateSets[i]) { if (dateSets[j].has(key)) overlap++ }
        if (overlap >= 4) union(i, j)
      }
    }

    // 컴포넌트별로 묶기
    const components = new Map<number, number[]>()
    for (let i = 0; i < group.length; i++) {
      const root = find(i)
      if (!components.has(root)) components.set(root, [])
      components.get(root)!.push(i)
    }

    for (const indices of components.values()) {
      if (indices.length < 2) continue
      // 이름이 가장 짧은 것을 대표로
      indices.sort((a, b) => group[a].data.name.length - group[b].data.name.length)
      const keepId = group[indices[0]].data.id
      const variantIds = indices.slice(1).map(i => group[i].data.id)
      variantMap.set(keepId, variantIds)
    }
  }

  return variantMap
}

export interface MergedGroup {
  representative: MinimalPersonData
  absorbed: MinimalPersonData[]
}

function normalizeMergedNote(note: string): string {
  return note
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')
}

function mergeVariantNotes(records: MinimalPersonData[]): string | undefined {
  const noteSources = new Map<string, string[]>()

  for (const record of records) {
    const normalized = record.notes ? normalizeMergedNote(record.notes) : ''
    if (!normalized) continue

    const existingSources = noteSources.get(normalized) ?? []
    if (!existingSources.includes(record.name)) existingSources.push(record.name)
    noteSources.set(normalized, existingSources)
  }

  if (noteSources.size === 0) return undefined

  return Array.from(noteSources.entries())
    .map(([note, sources]) => `[${sources.join(', ')}] ${note}`)
    .join('\n')
}

/**
 * variant 그룹을 자동 병합 — 대표 레코드(이름 가장 짧은 것) 유지, notes 병합
 * 반환: 병합 후 persons 목록 + 병합 그룹 정보
 */
export function mergeVariants(
  results: ConversionResult[],
  variantMap: Map<string, string[]>
): { persons: MinimalPersonData[]; groups: MergedGroup[] } {
  const allVariantIds = new Set<string>()
  for (const vids of variantMap.values()) vids.forEach(id => allVariantIds.add(id))

  const byId = new Map<string, MinimalPersonData>()
  results.forEach(r => { if (r.status !== 'error') byId.set(r.data.id, r.data) })

  const persons: MinimalPersonData[] = []
  const groups: MergedGroup[] = []

  for (const r of results) {
    if (r.status === 'error') continue
    const p = r.data
    if (allVariantIds.has(p.id)) continue
    if (variantMap.has(p.id)) {
      const variantIds = variantMap.get(p.id)!
      const absorbed = variantIds.map(id => byId.get(id)!).filter(Boolean)
      const mergedNotes = mergeVariantNotes([p, ...absorbed])
      const merged: MinimalPersonData = { ...p, notes: mergedNotes }
      persons.push(merged)
      groups.push({ representative: merged, absorbed })
    } else {
      persons.push(p)
    }
  }
  return { persons, groups }
}

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
