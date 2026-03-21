---
applyTo: "src/**"
description: "프로젝트 핵심 설명, 기술 스택, 폴더 구조 — 차샘 임포터 아키텍처"
---

# 프로젝트 아키텍처

## 프로젝트 목적

**차샘 만세력**(Chasam DB)에서 내보낸 JSON 파일을 읽어, **saju-cube** 서비스의 `MinimalPersonData` 형식으로 변환하고 Supabase에 저장하는 독립 웹 도구.

```
차샘 DB JSON
    ↓ parseChasamJson()
ChasamRecord[]
    ↓ convertBatch()
ConversionResult[]  (MinimalPersonData + 경고/오류)
    ↓ 사용자 리뷰 (수정/삭제)
    ↓ postPerson()
saju-cube Supabase
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
  - `POST /checkUserId` — 전화번호 사용자 존재 여부 확인
  - `POST /persons` — person 데이터 저장

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
├── specs/                        # 설계 문서 6개
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
- `detectPairs(records)`: 양음력 쌍 레코드 감지 → `PairGroup[]`
- `validateIlju(ilju)`: 일주(일간+일지) 유효성 검증

**birthdayType 처리**:
- `'S'` (양력) → 그대로 사용
- `'L'` (음력) → `lunartosolar()` 변환
- `'N'` (미상) → 양력으로 처리 + warning 추가

### `src/utils/sajuCubeAuth.ts`

saju-cube API 연동 모듈.

```ts
export const API_BASE: string
export function checkSajuCubeUser(phone: string): Promise<boolean>
export function postPerson(record: MinimalPersonData): Promise<void>
```

### `src/pages/ReviewPage.tsx`

4단계 플로우: `list` → `confirm` → `saving` → `done`

- **list**: 전체/경고/오류/쌍감지 탭, PersonCard(수정/삭제), EditModal
- **confirm**: 최종 목록 확인 + 저장방식 선택(JSON 다운로드 or saju-cube 직접 저장)
- **saving**: 로딩 + 진행 표시
- **done**: 성공/실패 결과 요약

서브컴포넌트 `PersonCard`, `EditModal`은 ReviewPage.tsx 내부에 함께 정의.

## 라우트 구조

```
/          → ImportPage   (차샘 파일 불러오기)
/review    → ReviewPage   (데이터 리뷰 + 저장)
/manual    → ManualInputPage (수동 입력)
```

## 개발 명령어

```bash
npm run dev    # localhost:5173 개발 서버
npm run build  # dist/ 빌드 (약 224kB)
npm run lint   # ESLint 검사
```
