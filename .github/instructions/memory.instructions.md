---
applyTo: "src/**"
description: "문제 해결 과정, 버그 픽스 히스토리, 엣지 케이스 기록"
---

# 문제 해결 히스토리 & 엣지 케이스

## 버그 픽스 히스토리

### BUG-001: PowerShell Set-Content 이모지/한글 인코딩 깨짐

**발생 시점**: ReviewPage.tsx 리팩토링 중  
**증상**: PowerShell `Set-Content -Encoding UTF8`으로 파일 저장 후 이모지(`✅`, `⚠️`, `❌`) 및 한글이 모두 깨진 문자로 교체됨. 파일 앞 501줄만 저장되고 나머지 잘림.  
**원인**: Windows PowerShell의 UTF-8 BOM 처리 방식과 멀티바이트 문자 인코딩 불일치  
**해결**:
1. 손상된 파일 삭제
2. `create_file` 도구로 재생성
3. 이모지를 유니코드 이스케이프로 교체

```ts
// 깨진 코드 (리터럴 이모지)
{ label: '✅ 성공' }

// 고친 코드 (유니코드 이스케이프)
{ label: '\u2705 성공' }
```

**예방 규칙**: JSX/TS 문자열에서 이모지 → 항상 `\uXXXX` 이스케이프 사용

---

### BUG-002: export default 중복 오류

**발생 시점**: ReviewPage.tsx `replace_string_in_file` 실패 후  
**증상**: `SyntaxError: Identifier 'ReviewPage' has already been declared` 빌드 오류  
**원인**: `replace_string_in_file`이 실패한 뒤 `create_file`을 호출하면 기존 파일에 새 코드가 append되어 `export default function ReviewPage()`가 2회 존재  
**해결**: 파일 삭제 후 `create_file`로 재생성  
**예방 규칙**: `create_file`은 신규 파일 전용. 기존 파일 수정은 반드시 `replace_string_in_file` 사용

---

### BUG-003: createdBy UUID 오해

**발생 시점**: ReviewPage postPerson 구현 중  
**증상**: saju-cube API에 UUID 형식의 userId를 전송했으나 서버 저장 실패  
**원인**: saju-cube의 `userId`/`createdBy`는 UUID가 아니라 전화번호 문자열  
**해결**: `createdBy: phone` (예: `'01012345678'`) 형태로 수정  
**검증 방법**: `checkSajuCubeUser('01012345678')` — 전화번호로 사용자 존재 확인

---

## 알려진 엣지 케이스

### 차샘 birthdayType 처리

| 값 | 의미 | 처리 방법 |
|----|------|-----------|
| `'S'` | 양력 (Solar) | 그대로 사용 |
| `'L'` | 음력 (Lunar) | `lunartosolar()` 변환 |
| `'N'` | 미상 (None) | 양력으로 처리 + `WARNING` 추가 |

`'N'` 타입은 ConversionResult의 `warnings` 배열에 경고 메시지 포함됨. ReviewPage에서 사용자가 직접 확인 가능.

---

### 음력 윤달 구분 불가

**상황**: 차샘 DB에 윤달 정보가 없음  
**결과**: `isLeapMonth` 항상 `false`로 설정  
**영향**: 음력 윤달 출생자의 양력 변환 날짜 오차 가능성 있음  
**현재 처리**: 경고 없이 일반 음력으로 처리 (개선 필요)

---

### S/L 쌍 레코드 (detectPairs)

**상황**: 차샘 DB에서 동일 인물에 대해 `birthdayType: 'S'`와 `'L'` 두 레코드가 존재하는 경우  
**감지**: `detectPairs()` — 이름+성별 기준으로 쌍 감지  
**처리**: ReviewPage "쌍 감지" 탭에서 사용자가 어느 레코드를 사용할지 직접 선택

---

### 일주(일간+일지) 검증 실패

**함수**: `validateIlju(ilju: string): boolean`  
**실패 케이스**:
- 한자가 GANJI_HANJA_TO_HANGUL 맵에 없는 경우
- 빈 문자열 또는 null 입력
- 길이가 2가 아닌 경우

**처리**: `validateIlju` 실패 시 ConversionResult의 `errors` 배열에 추가. ReviewPage "오류" 탭에서 별도 표시.

---

### 차샘 JSON 파싱 특이사항

- 차샘 파일은 표준 JSON이 아닌 경우 있음 (줄바꿈 구분 NDJSON 형식)
- `parseChasamJson(text)` 내부에서 양쪽 모두 시도
- 파싱 실패 시 사용자에게 오류 메시지 표시 (ImportPage)

---

## 계산 모듈 복사본 관리

saju-cube에서 복사한 모듈 목록 (경로만 수정, 로직 변경 없음):

| 파일 | 원본 위치 | 변경 내용 |
|------|-----------|-----------|
| calculationModule.ts | saju-cube/src/app/utils/ | `@/app/` → `@/` import 경로 수정 |
| dateCalculation.ts | saju-cube/src/app/utils/ | 동일 |
| daewoonCalculator.ts | saju-cube/src/app/utils/ | 동일 |
| monthGanjiCalculator.ts | saju-cube/src/app/utils/ | 동일 |
| elementColors.ts | saju-cube/src/app/utils/ | 동일 |
| labelMapping.ts | saju-cube/src/app/utils/ | 동일 |
| Person.ts | saju-cube/src/app/types/ | 동일 |

**주의**: saju-cube 원본이 업데이트되면 이 복사본도 수동으로 동기화 필요.
