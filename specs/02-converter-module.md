# Spec 02 — 변환 모듈 (chasamConverter.ts)

## 파일 위치

`src/utils/chasamConverter.ts`

## 의존 함수

| 함수 | 출처 파일 |
|---|---|
| `lunartosolar(year, month, day, isLeap)` | `src/utils/calculationModule.ts` |
| `solortolunar(year, month, day)` | `src/utils/calculationModule.ts` |
| `calculateAutoDates(year, month, day)` | `src/utils/dateCalculation.ts` |
| `sydtoso24yd(year, month, day, hour, min)` | `src/utils/calculationModule.ts` |

## 타입 정의

```typescript
// 차샘 원본 레코드
export interface ChasamRecord {
  id: string;
  sex: 'M' | 'F';
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthdayType: 'S' | 'L' | 'N';
  birthHour: number;
  birthMinute: number;
  birthDateTime: string;
  memo: string;
  ilju: string;
  iljuHanja: string;
}

// 변환 결과 (1건)
export interface ConversionResult {
  data: MinimalPersonData;
  warnings: string[];        // 경고 메시지 목록
  iljuValid: boolean;        // 일주 검증 통과 여부
  originalIlju: string;      // 차샘 원본 일주 (한글)
  calculatedIlju: string;    // 계산 결과 일주 (한글)
  status: 'ok' | 'warning' | 'error';
}

// 배치 변환 결과
export interface BatchConversionResult {
  results: ConversionResult[];
  totalCount: number;
  okCount: number;
  warningCount: number;
  errorCount: number;
}
```

## 현재 핵심 타입

```typescript
export interface PairGroup {
  key: string;
  sRecord?: ChasamRecord;
  lRecord?: ChasamRecord;
  isSingleS: boolean;
  isSingleL: boolean;
  isPair: boolean;
}

export interface MergedGroup {
  representative: MinimalPersonData;
  absorbed: MinimalPersonData[];
}
```

## 함수 명세

### `parseChasamJson(jsonText: string): ChasamRecord[]`
- JSON 문자열을 파싱해 `ChasamRecord[]` 반환
- 유효하지 않은 JSON → `Error("유효하지 않은 JSON 파일입니다")` throw
- 최상위가 배열이 아니면 → `Error("JSON 최상위가 배열이어야 합니다")` throw
- 필수 필드가 없는 항목은 건너뛰고 유효한 레코드만 반환

---

### `convertRecord(record: ChasamRecord, createdBy: string): ConversionResult`
차샘 1건을 `MinimalPersonData`로 변환한다.

```
1. 성별 변환: 'M'→'male', 'F'→'female'

2. birthdayType 처리:
   - 'S': isLunar=false, 날짜 그대로 사용
   - 'L': isLunar=true, 평달/윤달 후보를 모두 계산
          → 원본 ilju와 더 잘 맞는 후보가 있으면 채택
          → 확정이 어려우면 warning 추가
          → 둘 다 실패 시 status='error'
   - 'N': isLunar=false, warnings에 "N타입 경고" 추가

3. calculateAutoDates(year, month, day) 호출
   → additionalDates 6개 생성
   → 실패 시 status='error'

4. MinimalPersonData 조합
   - 음력 입력은 일부 케이스에서 `birthDate.isLeapMonth` 추론 가능
   - `record.memo`는 `notes`로 보존

5. 일주 검증: validateIlju(data, record.ilju)
   → 불일치 시 status='warning', warnings에 추가

6. ConversionResult 반환
```

---

### `convertBatch(records: ChasamRecord[], createdBy: string): BatchConversionResult`
- `records.map(r => convertRecord(r, createdBy))` 후 집계
- 통계 계산: `totalCount`, `okCount`, `warningCount`, `errorCount`

---

### `validateIlju(year, month, day, hour, minute, expectedIlju)`
일주 검증:
1. `sydtoso24yd(year, month, day, hour, minute)` 호출
2. `so24day` 인덱스 → `ganji[so24day]` (60갑자 배열에서 일주 추출)
3. `ganji[index]`를 한글로 변환 (간지 → 한글 대조표 사용)
4. `expectedIlju`와 비교 → 일치하면 `true`

---

### `stripVariantSuffix(name: string): string`
- 이름 끝의 `++`, `+-`, `-+`, `--`, `정`, `본`, `허`, 숫자 suffix 등을 제거해 base name을 만든다.
- 예: `홍길동++` → `홍길동`

### `detectVariants(results: ConversionResult[]): Map<string, string[]>`
- 현재 import 중복 판별의 핵심 함수
- `status !== 'error'` 인 결과만 대상으로 한다.
- 기준:
  - base name 동일
  - additionalDates 교집합이 4개 이상이면 같은 그룹
  - 양력→음력 변환 시 윤달 인접(`lmoonyun === 1`)이면 날짜 교집합 대신 이름 기준으로 병합 허용
- 반환:
  - `Map<대표 id, 병합될 id[]>`
  - 대표는 이름 길이가 가장 짧은 레코드

### `mergeVariants(results, variantMap)`
- `detectVariants()` 결과를 실제 저장/검토용 목록에 반영한다.
- 대표 레코드는 유지하고 흡수 레코드는 목록에서 제외한다.
- 병합 그룹 정보는 `ReviewPage`의 "그룹 병합" 탭에서 사용한다.
- `notes`는 대표 + 흡수 레코드 값을 모아 중복 제거 후 줄바꿈 병합한다.
- 병합 형식은 `[이름] 메모내용` 이며, 같은 메모가 여러 레코드에 있으면 이름만 합쳐서 1회만 남긴다.

### `detectPairs(records: ChasamRecord[]): PairGroup[]`
- 예전 S/L 쌍 감지 로직
- 현재 주요 UI 흐름은 `detectVariants()` + `mergeVariants()` 쪽이 중심이다.
- 기존 이름 기반 쌍 감지 규칙을 참고할 때만 사용한다.

## 에러 처리 원칙

- 개별 레코드 변환 실패 → throw하지 않고 `status: 'error'`로 반환
- 전체 파싱 실패만 throw
- 모든 경고는 한국어로 작성

## 구현과 문서가 자주 어긋나는 포인트

- `detectPairs()` 설명만 보고 현재 UI를 이해하면 안 된다.
- 현재 병합 UX는 "쌍 선택"이 아니라 "그룹 병합" 기준이다.
- 윤달 처리 개선은 아직 완료되지 않았으므로 `isLeapMonth`를 신뢰하면 안 된다.
