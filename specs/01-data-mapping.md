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

## 차샘 → 내부 MinimalPersonData 매핑

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
| — | — | → | `birthDate.isLeapMonth` | 음력 입력 시 후보 계산 후 일부 케이스에서 추론 |
| `memo` | string | → | `notes` | 그대로 (빈 문자열이면 undefined) |
| `ilju` | string | → | (저장 안 함) | 변환 후 검증용으로만 사용 |
| `iljuHanja` | string | → | (저장 안 함) | 변환 후 검증용으로만 사용 |

## birthdayType 변환

| 값 | `isLunar` | 추가 처리 |
|---|---|---|
| `'S'` | `false` | 없음 |
| `'L'` | `true` | 평달/윤달 후보를 모두 계산하고, `ilju`가 더 잘 맞는 후보가 있으면 그 결과로 저장 |
| `'N'` | `false` | `warnings` 배열에 경고 추가: `"birthdayType 'N' 감지 — 양력으로 처리됨, 수동 확인 필요"` |

## 자동 생성 필드

변환 시 아래 필드는 자동 생성:
- `createdAt`: `new Date()` (현재 시각)
- `updatedAt`: undefined
- `createdBy`: UI에서 확인한 사용자 전화번호
- `createdByNickname`: optional
- `additionalDates`: `calculateAutoDates(birthYear, birthMonth, birthDay)` 호출로 6개 자동 생성

## Review / Manual 저장 직전 확장 필드

실제 JSON 다운로드 및 DB 저장 직전에는 아래 값이 추가된다.

| 필드 | 설명 |
|---|---|
| `birthDate.dayPillar` | `sydtoso24yd()`로 계산한 한자 일주 |
| `birthDate.monthPillar` | `sydtoso24yd()`로 계산한 한자 월주 |
| `additionalDates[].dayPillar` | 각 additional date 기준 한자 일주 |
| `additionalDates[].monthPillar` | 각 additional date 기준 한자 월주 |
| `occupation` | 현재 기본값 `''` |
| `deathReason` | 현재 기본값 `''` |
| `isPrivate` | 현재 기본값 `false` |
| `birthPlace` | 현재 기본값 `''` |
| `referenceLinks` | 현재 기본값 `[]` |

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

## 저장용 split payload 구조

ReviewPage와 ManualInputPage는 저장 직전 flat payload를 만든 뒤, JSON 생성 또는 검증 시 split 구조를 사용한다.

```typescript
{
  person_basic: {
    id,
    createdAt,
    updatedAt,
    createdBy,
    createdByNickname,
    name,
    gender,
    occupation,
    deathReason,
    keywords,
    birthDate,
    additionalDates,
    isPrivate,
  },
  person_detail: {
    id,
    birthPlace,
    notes,
    referenceLinks,
    relationships,
    familyMemberIds,
  }
}
```

## 화면별 생성 차이

### Import → Review 경로
- 차샘 원본 `memo`가 `notes`로 넘어온다.
- 병합 그룹이 있으면 대표 레코드에 흡수 레코드 `notes`가 함께 합쳐질 수 있다.
- JSON 다운로드 시 `[{ person_basic, person_detail }]` 배열로 저장된다.

### Manual Input 경로
- 화면 입력값으로 가짜 `ChasamRecord`를 만들어 `convertRecord()`를 재사용한다.
- `createdByNickname`은 `UserIdInput`에서 자동 채움될 수 있다.
- DB 저장 전 같은 `createdBy` 계정 내 이름 + 생년월일 중복을 조회한다.

## 음력 처리 상세

`birthdayType === 'L'` 인 경우:
1. `lunartosolar(birthYear, birthMonth, birthDay, false)` 호출
2. `lunartosolar(..., true)` 도 함께 시도해 윤달 후보도 계산
3. 각 후보의 양력 날짜로 `validateIlju()`를 수행
4. 원본 `ilju`와 1개 후보만 일치하면 해당 후보를 채택
5. `birthDate.isLunar = true` 유지
6. 확정 불가 시 경고를 남기고 기본 후보로 처리
7. 변환 실패 시 → `warnings`에 추가, 해당 레코드 `status: 'error'` 처리

## isLeapMonth 한계

차샘 DB에는 윤달 여부를 직접 알려주는 필드가 없다.
현재는 평달/윤달 후보 계산 + `ilju` 비교로 일부 케이스만 추론한다.
확정 불가 케이스는 `warnings`에 포함해 사용자가 수동 확인하도록 유도한다.

## 현재 문서상 주의점

- `createdBy`는 UUID가 아니라 전화번호 문자열이다.
- `.env` 기반 userId 주입 문서로 이해하면 안 되고, 현재는 `UserIdInput` 확인 흐름이 기준이다.
- 저장 결과는 flat payload 그대로 보관하는 개념이 아니라 split 구조 검증까지 함께 본다.
