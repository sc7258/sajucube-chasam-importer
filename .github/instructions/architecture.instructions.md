---
applyTo: "src/**"
description: "프로젝트 핵심 설명, 기술 스택, 폴더 구조 — 차샘 임포터 아키텍처"
---

# 프로젝트 아키텍처

## 프로젝트 목적

**차샘 만세력**(Chasam DB)에서 내보낸 JSON 파일을 읽어, **saju-cube** 서비스의 `MinimalPersonData` 형식으로 변환하고 사용자가 검토한 뒤 JSON으로 내보내거나 saju-cube DB에 저장하는 독립 웹 도구.

```
차샘 DB JSON
    ↓ parseChasamJson()
ChasamRecord[]
    ↓ convertBatch()
ConversionResult[]  (MinimalPersonData + 경고/오류)
    ↓ 사용자 리뷰 (수정/삭제/병합 그룹 확인)
    ↓ JSON 다운로드 또는 postPerson()
saju-cube DB
```

## 기술 스택

| 항목 | 버전/내용 |
|------|-----------|
| React | 18.3.1 |
| Vite | 6.3.5 |
| TypeScript | strict 모드 |
| Tailwind CSS | v4 (`@tailwindcss/vite` 플러그인, config 파일 없음) |
| react-router | v7 (`import from 'react-router'`) |
| 패키지 매니저 | npm |
| 경로 alias | `@/` → `src/` |

## saju-cube API

- **Base URL**: `https://jjlxvljddlqdgqfwoaee.supabase.co/functions/v1/make-server-a1841ea8`
- **인증**: ANON_KEY 헤더 (sajuCubeAuth.ts 내부에 정의됨)
- **createdBy**: 전화번호 문자열 (예: `'01012345678'`) — UUID 아님
- **주요 엔드포인트**:
  - `GET /users/check-id` — 전화번호 사용자 존재 여부 확인
  - `GET /profile` — nickname 조회
  - `POST /persons` — person 데이터 저장
  - `GET /persons` — createdBy 기준 기존 데이터 조회
  - `GET /persons/:id` — 저장 직후 split 검증용 재조회

## 폴더 구조

```
sajucube-chasam-importer/
├── src/
│   ├── main.tsx                  # React 진입점
│   ├── App.tsx                   # BrowserRouter + 3 routes
│   ├── styles/
│   │   └── index.css             # @import "tailwindcss"
│   ├── pages/
│   │   ├── ImportPage.tsx        # 드래그앤드롭 + 파싱 + 미리보기
│   │   ├── ReviewPage.tsx        # 3단계 리뷰 플로우
│   │   └── ManualInputPage.tsx   # 수동 입력 + 계산
│   ├── components/
│   │   └── UserIdInput.tsx       # 전화번호 입력 + 사용자 검증
│   ├── utils/
│   │   ├── chasamConverter.ts    # 핵심 변환 로직
│   │   ├── sajuCubeAuth.ts       # saju-cube API 연동
│   │   ├── calculationModule.ts  # 사주 계산 (saju-cube 복사)
│   │   ├── dateCalculation.ts    # 날짜 계산 (saju-cube 복사)
│   │   ├── daewoonCalculator.ts  # 대운 계산 (saju-cube 복사)
│   │   ├── monthGanjiCalculator.ts
│   │   ├── elementColors.ts
│   │   └── labelMapping.ts
│   └── types/
│       └── Person.ts             # saju-cube Person 타입 (복사)
├── specs/                        # 설계/현행화/테스트 문서 7개
├── .github/
│   ├── instructions/             # Copilot 지침 파일
│   └── prompts/                  # Copilot 프롬프트 파일
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 핵심 모듈 설명

### `src/utils/chasamConverter.ts`

차샘 변환의 핵심 모듈.

- `GANJI_HANJA_TO_HANGUL`: 60갑자 한자→한글 매핑 (예: `'甲子'` → `'갑자'`)
- `parseChasamJson(text)`: 차샘 텍스트/JSON 파싱 → `ChasamRecord[]`
- `convertRecord(record, userId)`: 단일 레코드 변환 → `ConversionResult`
- `convertBatch(records, userId)`: 배치 변환 → `BatchConversionResult`
- `detectVariants(results)`: 이름 변형/양음력 변형/윤달 예외를 고려한 병합 그룹 감지
- `mergeVariants(results, variantMap)`: 대표 레코드 유지 + absorbed 레코드 병합
- `validateIlju(ilju)`: 일주(일간+일지) 유효성 검증

**birthdayType 처리**:
- `'S'` (양력) → 그대로 사용
- `'L'` (음력) → `lunartosolar()` 변환
- `'N'` (미상) → 양력으로 처리 + warning 추가

### `src/utils/sajuCubeAuth.ts`

saju-cube API 연동 모듈.

- `checkSajuCubeUser(phone)`: 사용자 확인 + nickname 조회
- `fetchPersonsByUser(phone)`: 수동 입력 중복 확인용 조회
- `fetchPersonById(id, phone)`: 저장 후 split 검증용 조회
- `postPerson(record)`: person 저장

### `src/pages/ReviewPage.tsx`

4단계 플로우: `list` → `confirm` → `saving` → `done`

- **list**: 전체/경고/오류/그룹 병합 탭, PersonCard(수정/삭제), EditModal
- **confirm**: 최종 목록 확인 + 저장방식 선택(JSON 다운로드 or saju-cube 직접 저장)
- **saving**: 로딩 + 저장 진행
- **done**: 성공/실패 결과 요약 + split mismatch 이름 표시 가능

서브컴포넌트 `PersonCard`, `EditModal`은 ReviewPage.tsx 내부에 함께 정의.

### `src/pages/ImportPage.tsx`

- `UserIdInput`으로 사용자 확인 후에만 ReviewPage로 이동 가능
- 변환 결과 일부만 체크박스로 선택해 전달 가능
- 선택 건수와 이름순 정렬 상태를 함께 표시

### `src/pages/ManualInputPage.tsx`

- JSON 생성과 DB 저장을 모두 지원
- 저장 전 기존 person 중복 체크 수행
- 1건 중복 시 메모 병합 후 저장 옵션 제공
- 저장 후 서버 재조회로 split 결과 자동 검증

## 라우트 구조

```
/          → ImportPage   (차샘 파일 불러오기)
/review    → ReviewPage   (데이터 리뷰 + 저장)
/manual    → ManualInputPage (수동 입력)
```

## 개발 명령어

```bash
npm run dev    # localhost:5173 개발 서버
npm run build  # dist/ 빌드
npm run lint   # ESLint 검사
```
