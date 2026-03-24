import {
  convertRecord,
  mergeVariants,
  type ChasamRecord,
  type ConversionResult,
} from '../src/utils/chasamConverter'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function logSection(title: string): void {
  console.log(`\n[${title}]`)
}

const createdBy = '01012345678'

const normalRecord: ChasamRecord = {
  id: 'normal-1',
  sex: 'M',
  name: '홍길동',
  birthYear: 1972,
  birthMonth: 1,
  birthDay: 26,
  birthdayType: 'S',
  birthHour: 11,
  birthMinute: 30,
  birthDateTime: '197201261130',
  memo: '',
  ilju: '병진',
  iljuHanja: '丙辰',
}

const unknownBirthdayTypeRecord: ChasamRecord = {
  ...normalRecord,
  id: 'unknown-1',
  name: '유형검사',
  birthdayType: 'N',
}

const mergeBase: ConversionResult = {
  data: {
    id: 'merge-1',
    createdAt: new Date(),
    createdBy,
    name: '김철수',
    gender: 'male',
    birthDate: { year: 1980, month: 3, day: 10, hour: 10, minute: 0, isLunar: false, isLeapMonth: false },
    notes: '본원',
    additionalDates: [
      { label: '본원', year: 1980, month: 3, day: 10 },
      { label: '본원+1', year: 1981, month: 3, day: 10 },
      { label: '본원+2', year: 1982, month: 3, day: 10 },
      { label: '본원+3', year: 1983, month: 3, day: 10 },
    ],
  },
  warnings: [],
  iljuValid: true,
  originalIlju: '갑자',
  calculatedIlju: '갑자',
  status: 'ok',
}

const mergeVariant: ConversionResult = {
  data: {
    ...mergeBase.data,
    id: 'merge-2',
    name: '김철수++',
    notes: '본원',
  },
  warnings: [],
  iljuValid: true,
  originalIlju: '갑자',
  calculatedIlju: '갑자',
  status: 'ok',
}

const mergeVariantWithDifferentNote: ConversionResult = {
  data: {
    ...mergeBase.data,
    id: 'merge-3',
    name: '김철수허',
    notes: '허자 가능성',
  },
  warnings: [],
  iljuValid: true,
  originalIlju: '갑자',
  calculatedIlju: '갑자',
  status: 'ok',
}

function main(): void {
  logSection('convertRecord - normal')
  const normal = convertRecord(normalRecord, createdBy)
  console.log(normal.status, normal.calculatedIlju, normal.data.birthDate)
  assert(normal.status === 'ok', '정상 양력 레코드는 ok 여야 합니다')

  logSection('convertRecord - birthdayType N')
  const unknownType = convertRecord(unknownBirthdayTypeRecord, createdBy)
  console.log(unknownType.status, unknownType.warnings)
  assert(unknownType.status === 'warning', 'birthdayType N 은 warning 이어야 합니다')
  assert(unknownType.warnings.some(w => w.includes("birthdayType 'N'")), 'N 타입 경고가 있어야 합니다')

  logSection('mergeVariants - note merge')
  const variantMap = new Map<string, string[]>([['merge-1', ['merge-2', 'merge-3']]])
  const merged = mergeVariants([mergeBase, mergeVariant, mergeVariantWithDifferentNote], variantMap)
  console.log(merged.groups[0].representative.notes)
  assert(merged.persons.length === 1, '병합 후 대표 1건만 남아야 합니다')
  assert(merged.groups.length === 1, '병합 그룹 1개가 생성되어야 합니다')
  assert(merged.groups[0].representative.notes?.includes('[김철수, 김철수++] 본원') ?? false, '중복 메모는 출처 이름만 합쳐져야 합니다')
  assert(merged.groups[0].representative.notes?.includes('[김철수허] 허자 가능성') ?? false, '서로 다른 메모는 별도 줄로 남아야 합니다')

  console.log('\nconverter smoke test passed')
}

main()
