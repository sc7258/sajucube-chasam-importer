---
description: "프로젝트 전체 로드맵 및 현재 Todo 확인"
---

# 프로젝트 로드맵 & Todo 리스트

## 현재 구현 상태 (완료)

### Phase 1 — 기반 구축 ✅
- [x] 프로젝트 스캐폴딩 (Vite + React + TypeScript + Tailwind v4)
- [x] npm 의존성 설치 (109 packages)
- [x] 경로 alias (@/ → src/) 설정
- [x] specs/ 설계 문서 6개 작성

### Phase 2 — 계산 로직 ✅
- [x] saju-cube 계산 모듈 7개 복사 (import 경로 수정)
- [x] Person 타입 복사
- [x] chasamConverter.ts 완전 구현
  - GANJI_HANJA_TO_HANGUL 60갑자 매핑
  - parseChasamJson / validateIlju / convertRecord / convertBatch / detectPairs

### Phase 3 — API 연동 ✅
- [x] sajuCubeAuth.ts 구현 (checkSajuCubeUser + postPerson)
- [x] UserIdInput.tsx 컴포넌트 (전화번호 입력 + 검증 UI)

### Phase 4 — 페이지 구현 ✅
- [x] ImportPage.tsx (드래그앤드롭 + 변환 + 미리보기)
- [x] ReviewPage.tsx (list → confirm → saving → done 4단계)
  - PersonCard, EditModal 서브컴포넌트
  - 전체/경고/오류/쌍감지 탭
- [x] ManualInputPage.tsx (수동 입력 + calculateAutoDates + JSON 다운로드)
- [x] App.tsx 라우터 (/, /review, /manual)

### Phase 5 — 빌드 검증 ✅
- [x] `npm run build` 성공 (dist/ ~224kB)
- [x] `npm run dev` 성공 (localhost:5173)

### Phase 6 — ManualInputPage DB 직접 저장 ✅ (2026-03-21)
- [x] 생시 입력 → time input + 실시간 시(時) 뱃지 표시 (오전/오후 + 시 이름)
- [x] 6개 명식 날짜 달력 순 정렬
- [x] JSON 다운로드 → DB 직접 POST 방식으로 전환
- [x] `sydtoso24yd()`로 dayPillar/monthPillar 계산
- [x] `GANJI_HANJA_TO_HANGUL` export 추가
- [x] person_basic + person_detail 필드 모두 포함한 단일 payload 구성

### Phase 7 — payload 고도화 ✅ (2026-03-21)
- [x] `saju-cube` 서버 check-id 응답에 `nickname: user.nickname ?? ''` 추가 (로컬만, 미배포)
- [x] `UserCheckResult`에 `nickname?: string` 필드 추가
- [x] `checkSajuCubeUser()` 반환값에 `nickname` 포함
- [x] `UserIdInput` — 확인 후 닉네임 수동 입력 필드 표시 (서버 응답에 nickname 있으면 자동 채움)
- [x] 확인/오류 아이콘 이모지 제거 (JSX 텍스트 노드에서 `\uXXXX` 미작동 — 아이콘 없이 처리)
- [x] ManualInputPage — `createdByNickname` state + `onNicknameChange` 연결
- [x] dayPillar/monthPillar를 한글 → **한자**로 변경 (`ganji[]` 직접 사용)
- [x] 모든 additionalDates에 각각 `sydtoso24yd()` 계산 후 한자 pillar 추가
- [x] payload에 `occupation: ''`, `deathReason: ''`, `createdByNickname` 추가
- [x] 빌드 성공 (225.90 kB)

### Phase 8 — createdByNickname 자동 채움 & 중복 저장 방지 ✅ (2026-03-21)
- [x] `UserIdInput`: 확인 후 닉네임 필드 표시 (readonly, disabled 스타일)
- [x] `UserIdInput`: 확인/오류 이모지 제거 (JSX 텍스트 노드 `\uXXXX` 깨짐 문제)
- [x] `sajuCubeAuth.ts`: `/profile` 엔드포인트(X-User-Id 헤더)로 nickname 자동 조회
- [x] `sajuCubeAuth.ts`: `fetchPersonsByUser()` 추가 — createdBy 기준 persons 목록 조회
- [x] `ManualInputPage`: 저장 전 이름+생년월일 중복 체크
- [x] `ManualInputPage`: 중복 발견 시 confirm 모달 표시 (이름/생년월일/ID 표시)
- [x] 빌드 성공 (228.13 kB)

### Phase 9 — 미인증 사용자 저장 차단 ✅ (2026-03-21)
- [x] `UserIdInput`: `onValidChange?: (valid: boolean) => void` prop 추가
- [x] `UserIdInput`: 확인 성공/실패 시 `onValidChange` 호출
- [x] `UserIdInput`: 전화번호 변경 시 `onValidChange(false)` 초기화
- [x] `ManualInputPage`: `isUserVerified` state 추가
- [x] `ManualInputPage`: `UserIdInput`에 `onValidChange={setIsUserVerified}` 연결
- [x] `ManualInputPage`: 저장 버튼 `disabled={!name.trim() || !isUserVerified || saveStatus === 'saving'}`
- [x] 빌드 성공 (228.23 kB)

### Phase 10 — ImportPage/ReviewPage payload 완전화 ✅ (2026-03-21)
- [x] `ImportPage`: `createdByNickname` state 추가 + `UserIdInput`에 `onNicknameChange` 연결
- [x] `ImportPage`: `navigate('/review', { state: { ..., createdByNickname } })` 추가
- [x] `ReviewPage`: `location.state`에서 `createdBy`, `createdByNickname` 수신
- [x] `ReviewPage`: `sydtoso24yd`, `ganji` import 추가
- [x] `ReviewPage`: `handleSave()`에서 ManualInputPage와 동일한 payload 조립 (dayPillar/monthPillar, additionalDates 한자 pillar, occupation/deathReason/isPrivate/birthPlace/referenceLinks/createdByNickname)
- [x] 빌드 성공 (229.05 kB)

### Phase 11 — ImportPage 미인증 사용자 차단 ✅ (2026-03-21)
- [x] `ImportPage`: `isUserVerified` state 추가
- [x] `ImportPage`: `UserIdInput`에 `onValidChange={setIsUserVerified}` 연결
- [x] `ImportPage`: 다음 단계 버튼 `disabled={!isUserVerified}` 로 변경
- [x] `ImportPage`: 안내 문구 "사용자 ID 확인 후 진행할 수 있습니다" 로 변경
- [x] 빌드 성공 (229.09 kB)

### Phase 12 — 차샘 variant 중복 감지 ✅ (2026-03-22)
- [x] `chasamConverter.ts`: `stripVariantSuffix()` — 접미사 제거 후 base name 반환
  - 접미사 패턴: `++`, `+-`, `-+`, `--`, `정`, `본`, `허`, `부허`, `1`, `2`, `3` (이름 끝에 붙는 것만)
- [x] `chasamConverter.ts`: `detectVariants(results)` 함수 추가
  - base name 동일 AND additionalDates 교집합 4개 이상 → 같은 그룹
  - 그룹 내 대표: 이름이 가장 짧은 것 (원본 추정)
  - `Map<keepId, variantIds[]>` 반환
- [x] `ReviewPage`: `detectVariants()` import 및 호출
- [x] `ReviewPage`: variant IDs를 `excludedVariants` state로 관리 (초기 자동 제외)
- [x] `ReviewPage`: "변형 중복 (제외)" 탭 추가 — 제외된 variant 목록 표시 + 개별 포함 복원 버튼
- [x] `ReviewPage`: 저장 목록에서 excludedVariants 자동 제외
- [x] 빌드 성공 (231.60 kB)

### Phase 13 — calculateAutoDates 엣지케이스 수정 ✅ (2026-03-22)
- [x] `dateCalculation.ts`: 윤달(lmoonyun=1) 시 본원–1 계산 — 윤달 체크 제거, 음력 숫자를 그대로 양력으로 사용
- [x] `dateCalculation.ts`: 음력에 없는 날(소월) 시 본원+1/+2/+3 계산 — `tryLunarToSolar()` fallback 헬퍼 추가 (같은 달 마지막 유효일로 내림)
- [x] `dateCalculation.ts`: 본원–2 윤달 체크도 동일하게 제거
- [x] 빌드 성공 (231.65 kB)

### Phase 14 — ReviewPage 이름순 정렬 버튼 ✅ (2026-03-22)
- [x] `ReviewPage`: `sortByName` state 추가
- [x] `ReviewPage`: 전체/경고 탭 목록에 `localeCompare('ko')` 정렬 적용
- [x] `ReviewPage`: stats 줄 옆에 "이름순 정렬" 토글 버튼 추가 (활성 시 blue 스타일)
- [x] 빌드 성공 (231.65 kB)

### Phase 15 — 쌍 감지 → 그룹 병합으로 통합 ✅ (2026-03-22)
- [x] `chasamConverter.ts`: `MergedGroup` 인터페이스 + `mergeVariants(results, variantMap)` 함수 추가
- [x] `ReviewPage`: `detectPairs` / `rawRecords` / `excludedVariants` / `restoreVariant` 제거
- [x] `ReviewPage`: `mergeVariants()` 호출 → `initialPersons` / `mergedGroups` 초기화
- [x] `ReviewPage`: `FilterTab` 타입 `'pairs' | 'variants'` → `'groups'` 교체
- [x] `ReviewPage`: "그룹 병합" 탭 UI — 대표 + 흡수된 이름 목록 표시
- [x] 빌드 성공 (230.39 kB)

### Phase 16 — detectVariants 윤달 예외 처리 ✅ (2026-03-22)
- [x] `chasamConverter.ts`: `solortolunar` import 추가
- [x] `chasamConverter.ts`: `detectVariants()` — 양력 생년월일을 음력으로 변환 시 `lmoonyun === 1`이면 윤달로 판단
- [x] `chasamConverter.ts`: 그룹 내 비교 시 둘 중 하나라도 윤달이면 이름만으로 병합 (dateIntersection 스킵)
- [x] 빌드 성공 (230.55 kB)

### Phase 17 — ManualInputPage 중복 모달 메모 병합 옵션 ✅ (2026-03-22)
- [x] `ManualInputPage`: `dupInfo` 타입에 `notes?: string` 필드 추가
- [x] `ManualInputPage`: 중복 감지 시 기존 `notes` 포함하여 `dupInfo` 저장
- [x] `ManualInputPage`: 중복 모달에 기존 메모 표시
- [x] `ManualInputPage`: 1건일 때만 "메모 병합 후 저장" 버튼 표시 — `[기존notes, 새notes].filter(Boolean).join(' / ')`
- [x] 빌드 성공 (231.03 kB)

### Phase 18 — ReviewPage JSON 내보내기 payload 완전화 ✅ (2026-03-22)
- [x] `ReviewPage`: JSON 저장 시도 supabase와 동일한 payload 조립 (dayPillar/monthPillar, additionalDates pillar, occupation/deathReason/isPrivate/birthPlace/referenceLinks/notes/createdByNickname)
- [x] 빌드 성공 (231.08 kB)

### Phase 19 — JSON export를 person_basic/person_detail split 포맷으로 + ManualInputPage JSON 생성 버튼 ✅ (2026-03-22)
- [x] `splitPersonPayload()` 헬퍼 추가 (양 파일) — 서버 `splitPersonData()`와 동일 필드 (keywords 포함)
- [x] `ReviewPage`: JSON 저장 경로를 split 포맷으로 변경 (`[{ person_basic, person_detail }]`)
- [x] `ManualInputPage`: `buildFlatPayload()` 함수 추출 (handleSave·handleDownloadJson 공유)
- [x] `ManualInputPage`: `handleDownloadJson()` 추가 — split JSON 다운로드 (인증 불필요)
- [x] `ManualInputPage`: "JSON 생성" 버튼 추가 (DB에 저장 버튼 옆)
- [x] 빌드 성공 (233.75 kB)

### Phase 20 — ManualInputPage DB저장 후 서버 split 결과와 자동 비교 ✅ (2026-03-22)
- [x] `sajuCubeAuth.ts`: `fetchPersonById()` 추가 — GET /persons/:id
- [x] `doSave()` 성공 후: `fetchPersonById`로 서버 저장 레코드 재조회
- [x] 클라이언트 `splitPersonPayload(payload)` ↔ 서버 `splitPersonPayload(savedFlat)` deep-compare
- [x] 차이 발생 시 `console.warn` + 화면 `saveError` 토스트 표시; 일치 시 `console.log` ✅
- [x] 빌드 성공 (233.75 kB)

### Phase 21 — deep-compare 키 순서 무관 비교로 개선 ✅ (2026-03-22)
- [x] `deepEqual()` 재귀 헬퍼 추가 — 객체 키 정렬 후 비교, 배열 순서는 유지
- [x] `doSave()` 비교 로직: `JSON.stringify` → `deepEqual` 로 교체
- [x] 빌드 성공 (234.15 kB)

### Phase 22 — 저장 성공 메시지에 split 검증 결과 통합 ✅ (2026-03-22)
- [x] `verifyResult` state 추가: `'match' | 'mismatch' | null`
- [x] `verifyDiffs` state 추가: `string[]`
- [x] `doSave()`: 검증 결과를 `saveError` 대신 `verifyResult`/`verifyDiffs`로 분리
- [x] 일치 → "saju-cube DB에 저장되었습니다. 생성된 json과 일치합니다."
- [x] 불일치 → 초록 저장 메시지 + 노란 경고 별도 표시
- [x] 빌드 성공 (234.50 kB)

### Phase 23 — ReviewPage DB 저장에도 split 검증 추가 ✅ (2026-03-22)
- [x] `fetchPersonById` import 추가
- [x] `deepEqual` 헬퍼를 ReviewPage에 추가 (module-level)
- [x] `SaveResult` 인터페이스에 `mismatchNames: string[]` 추가
- [x] DB 저장 루프: 각 건 저장 후 `fetchPersonById` → `deepEqual` 비교, 불일치 건 수집
- [x] done 단계: 전체 일치 → 초록 "생성된 json과 일치합니다.", 불일치 → 노란 경고 + 이름 목록
- [x] 빌드 성공 (235.70 kB)

---

## 당장 해야 할 Todo

### Priority 1 — 기능 완성

- [ ] **실제 차샘 DB 파일 end-to-end 테스트**
  - Chasam_DB_20210113063107.txt 로드 → 변환 → ReviewPage 확인
  - 오류/경고 케이스 실제 데이터로 검증

- [ ] **저장 진행률 표시 개선**
  - 현재: 로딩 스피너만 표시
  - 목표: "N / M 건 저장 중..." 실시간 카운터 표시
  - 위치: ReviewPage saving 단계

- [ ] **postPerson 실패 건 재시도**
  - 저장 실패한 개별 레코드에 "재시도" 버튼 추가
  - 위치: ReviewPage done 단계 오류 목록

### Priority 2 — 데이터 품질

- [x] **수동 입력 중복 저장 방지** ← 완료 (Phase 8)

- [ ] **음력 윤달 처리 개선**
  - 차샘 레코드에서 윤달 여부를 추론할 방법 탐색
  - 현재 `isLeapMonth` 항상 false → 경고 추가 검토

### Priority 3 — UX 개선

- [ ] **S/L 쌍 레코드 자동 병합 제안**
  - detectPairs()로 쌍 감지 후 어느 버전(양력/음력) 사용할지 자동 추천
  - 현재: 사용자가 수동으로 탭에서 선택

- [ ] **저장 결과 CSV 내보내기**
  - 성공/실패 내역을 CSV로 다운로드
  - 현재: JSON 다운로드만 지원

---

## 향후 로드맵

### v1.1 — 신뢰성 향상
- postPerson 재시도 로직 (Priority 1)
- 중복 감지 (Priority 2)
- 진행률 표시 (Priority 1)

### v1.2 — 다중 파일 지원
- ImportPage에서 여러 파일 동시 드롭
- 파일별 변환 결과 집계

### v1.3 — 배치 최적화
- postPerson 병렬 저장 (현재 순차)
- Supabase rate limit 고려한 throttle 설정

### v2.0 — saju-cube 직접 통합
- 별도 프로그램 대신 saju-cube 내 "가져오기" 기능으로 통합 고려
