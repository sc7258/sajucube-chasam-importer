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
