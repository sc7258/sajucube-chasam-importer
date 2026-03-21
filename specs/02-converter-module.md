# Spec 02 — 변환 모듈 (chasamConverter.ts)

## 파일 위치

`src/utils/chasamConverter.ts`

## 의존 함수 (saju-cube에서 복사한 파일들)

| 함수 | 출처 파일 |
|---|---|
| `lunartosolar(year, month, day, isLeap)` | `src/utils/calculationModule.ts` |
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

## 함수 명세

### `parseChasamJson(jsonText: string): ChasamRecord[]`
- JSON 문자열을 파싱해 `ChasamRecord[]` 반환
- 유효하지 않은 JSON → `Error("유효하지 않은 JSON 파일입니다")` throw
- 배열이 아닌 경우 → `Error("JSON 최상위가 배열이어야 합니다")` throw
- 각 레코드의 필수 필드(`id`, `name`, `sex`, `birthYear`) 없을 시 해당 레코드 건너뜀 + 경고

---

### `convertRecord(record: ChasamRecord, createdBy: string): ConversionResult`
1건 변환. 내부 흐름:

```
1. gender 변환: 'M'→'male', 'F'→'female'

2. birthdayType 처리:
   - 'S': isLunar=false, 날짜 그대로 사용
   - 'L': isLunar=true, lunartosolar() 호출
          → 실패 시 status='error', warnings에 추가
   - 'N': isLunar=false, warnings에 "N타입 경고" 추가

3. calculateAutoDates(year, month, day) 호출
   → additionalDates 6개 생성
   → 실패 시 status='error'

4. MinimalPersonData 조합

5. 일주 검증: validateIlju(data, record.ilju)
   → 불일치 시 status='warning', warnings에 추가

6. ConversionResult 반환
```

---

### `convertBatch(records: ChasamRecord[], createdBy: string): BatchConversionResult`
- `records.map(r => convertRecord(r, createdBy))` 후 집계
- 통계 계산: totalCount, okCount, warningCount, errorCount

---

### `validateIlju(data: MinimalPersonData, expectedIlju: string): boolean`
일주 검증:
1. `sydtoso24yd(year, month, day, hour, minute)` 호출
2. `so24day` 인덱스 → `ganji[so24day]` (60갑자 배열에서 일주 추출)
3. `ganji[index]`를 한글로 변환 (간지 → 한글 대조표 사용)
4. `expectedIlju`와 비교 → 일치하면 `true`

> 간지 한글 대조표: 갑을병정무기경신임계 + 자축인묘진사오미신유술해
> 예: 인덱스 2(丙辰) → "병진"

---

### `detectPairs(records: ChasamRecord[]): PairGroup[]`
S/L 쌍 감지:

```typescript
interface PairGroup {
  key: string;           // 그룹 키 (이름 기반)
  sRecord?: ChasamRecord;
  lRecord?: ChasamRecord;
  isSingleS: boolean;    // S만 있고 L 없음
  isSingleL: boolean;    // L만 있고 S 없음
  isPair: boolean;       // S+L 둘 다 있음
}
```

감지 규칙:
- 이름이 같고 one은 S, 다른 one는 L → 쌍
- 이름 + "2", 이름 + "+", 이름 + "-" suffix 패턴도 같은 사람으로 감지
- 쌍으로 감지된 경우 S 레코드를 `본원`으로 처리

## 에러 처리 원칙

- 개별 레코드 변환 실패 → throw하지 않고 `status: 'error'`로 반환
- 전체 파싱 실패만 throw
- 모든 경고는 한국어로 작성
