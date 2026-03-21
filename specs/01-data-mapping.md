# Spec 01 — 데이터 필드 매핑

## 차샘 DB 전체 필드

```typescript
interface ChasamRecord {
  id: string;            // UUID
  sex: 'M' | 'F';
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthdayType: 'S' | 'L' | 'N';
  birthHour: number;
  birthMinute: number;
  birthDateTime: string; // "YYYYMMDDHHMI" 형태 문자열 (파싱 불필요, 개별 필드 사용)
  memo: string;
  ilju: string;          // 일주 한글 (예: "병진") — 검증용, 저장 안 함
  iljuHanja: string;     // 일주 한자 (예: "丙辰") — 검증용, 저장 안 함
}
```

## 매핑 테이블

| 차샘 필드 | 차샘 타입 | → | saju-cube 필드 | 변환 규칙 |
|---|---|---|---|---|
| `id` | string (UUID) | → | `id` | 그대로 사용 |
| `name` | string | → | `name` | 그대로 |
| `sex` | `'M'\|'F'` | → | `gender` | `'M'→'male'`, `'F'→'female'` |
| `birthYear` | number | → | `birthDate.year` | 그대로 |
| `birthMonth` | number | → | `birthDate.month` | 그대로 |
| `birthDay` | number | → | `birthDate.day` | 그대로 |
| `birthHour` | number | → | `birthDate.hour` | 그대로 |
| `birthMinute` | number | → | `birthDate.minute` | 그대로 |
| `birthdayType` | `'S'\|'L'\|'N'` | → | `birthDate.isLunar` | 아래 표 참조 |
| — | — | → | `birthDate.isLeapMonth` | 항상 `false` (차샘에 윤달 구분 없음) |
| `memo` | string | → | `notes` | 그대로 (빈 문자열이면 undefined) |
| `ilju` | string | → | (저장 안 함) | 변환 후 검증용으로만 사용 |
| `iljuHanja` | string | → | (저장 안 함) | 변환 후 검증용으로만 사용 |

## birthdayType 변환

| 값 | `isLunar` | 추가 처리 |
|---|---|---|
| `'S'` | `false` | 없음 |
| `'L'` | `true` | `lunartosolar()` 호출해 양력 날짜로 변환 후 저장. 단, `isLunar: true` 플래그는 유지 |
| `'N'` | `false` | `warnings` 배열에 경고 추가: `"birthdayType 'N' 감지 — 양력으로 처리됨, 수동 확인 필요"` |

## 자동 생성 필드

변환 시 아래 필드는 자동 생성:
- `createdAt`: `new Date()` (현재 시각)
- `updatedAt`: undefined
- `createdBy`: `.env` 또는 UI에서 입력받은 userId
- `createdByNickname`: optional
- `additionalDates`: `calculateAutoDates(birthYear, birthMonth, birthDay)` 호출로 6개 자동 생성

## MinimalPersonData 타입 (참조)

```typescript
// saju-cube: src/app/types/MinimalPersonData.ts
interface MinimalPersonData {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  createdByNickname?: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isLunar?: boolean;
    isLeapMonth?: boolean;
  };
  birthPlace?: string;
  occupation?: string;
  deathReason?: string;
  notes?: string;
  additionalDates: Array<{
    label: string; // '본원-2'|'본원-1'|'본원'|'본원+1'|'본원+2'|'본원+3'
    year: number;
    month: number;
    day: number;
  }>;
}
```

## 음력 처리 상세

`birthdayType === 'L'` 인 경우:
1. `lunartosolar(birthYear, birthMonth, birthDay, false)` 호출
2. 반환된 양력 날짜를 `birthDate.year/month/day`에 저장
3. `birthDate.isLunar = true` 유지 (원래 음력이었음을 기록)
4. `birthDate.isLeapMonth = false` (차샘에서 윤달 구분 없음)
5. 변환 실패 시 (잘못된 음력 날짜) → `warnings`에 추가, 해당 레코드 `status: 'error'` 처리

## isLeapMonth 한계

차샘 DB에는 윤달 여부 정보가 없다.
일주 검증 후 불일치 시 해당 레코드를 `warnings`에 포함해 사용자가 수동 확인하도록 유도.
