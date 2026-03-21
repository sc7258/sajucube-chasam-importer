---
applyTo: "src/**"
description: "코딩 컨벤션 및 금지 사항 — 차샘 임포터 프로젝트 규칙"
---

# 코딩 컨벤션 및 금지 사항

## 패키지 매니저

- **npm** 사용 (pnpm, yarn 금지)
- 새 패키지 설치: `npm install <패키지명>`

## 언어 및 타입

- TypeScript **strict 모드** 필수 (`tsconfig.json` 설정됨)
- `any` 타입 사용 금지 — 구체적 타입 또는 제네릭 사용
- 모든 함수 파라미터/반환값에 타입 명시
- `as unknown as X` 이중 캐스팅 금지

## 프레임워크 규칙

- **react-router v7**: 반드시 `'react-router'` 에서 import (`'react-router-dom'` 금지)
- **Tailwind CSS v4**: config 파일 없음, `@tailwindcss/vite` 플러그인 사용
  - `tailwind.config.js` 또는 `tailwind.config.ts` 생성 금지
  - CSS에서 `@tailwind base;` 등 v3 지시어 금지, `@import "tailwindcss"` 사용
- **React**: 함수형 컴포넌트 + Hooks만 사용, 클래스 컴포넌트 금지

## 경로 alias

- `@/` → `src/` (vite.config.ts 설정됨)
- 상대경로(`../../`) 대신 `@/utils/...`, `@/components/...` 형태 사용

## 파일 구조

- 컴포넌트 파일 1개당 export default 1개
- `PersonCard`, `EditModal` 같은 서브컴포넌트는 사용하는 페이지 파일 내에 함께 정의 가능
- 상수(HOUR_OPTIONS 등)는 파일 상단에 정의

## 이모지 규칙 (CRITICAL)

이모지를 JSX 문자열에서 사용할 때 **반드시 유니코드 이스케이프** 사용:

```ts
// 올바름
const icon = '\u2705';       // ✅
const warn = '\u26a0\ufe0f'; // ⚠️
const err  = '\u274c';       // ❌
const link = '\uD83D\uDD17'; // 🔗
```

```ts
// 금지 — 리터럴 이모지 직접 삽입 금지
const icon = '✅';  // 깨짐 위험
```

**이유**: PowerShell `Set-Content`으로 파일 수정 시 이모지·한글이 깨지는 Windows 인코딩 버그 존재.

## 파일 수정 방법

- 파일 편집: `replace_string_in_file` 또는 `create_file` 도구 사용
- **PowerShell `Set-Content`으로 파일 전체 재작성 금지** — 인코딩 손상 발생
- `Out-File`, `>>` 리다이렉션도 이모지/한글 포함 파일에 금지

## API 연동

- API Base URL 및 인증 정보는 `src/utils/sajuCubeAuth.ts` 에만 정의
- 컴포넌트 내부에서 직접 `fetch` 호출 금지 — `sajuCubeAuth.ts` 함수 사용
- `createdBy` 값 = 전화번호 문자열 (예: `'01012345678'`) — UUID 형식 절대 아님

## 네이밍

- 컴포넌트: PascalCase (`PersonCard`, `EditModal`)
- 유틸 함수: camelCase (`convertRecord`, `detectPairs`)
- 상수: UPPER_SNAKE_CASE (`GANJI_HANJA_TO_HANGUL`, `HOUR_OPTIONS`)
- 파일명: camelCase.ts / PascalCase.tsx

## 금지 사항 요약

| 금지 | 대안 |
|------|------|
| `import ... from 'react-router-dom'` | `import ... from 'react-router'` |
| `any` 타입 | 구체적 타입 또는 제네릭 |
| 리터럴 이모지 문자열 | `\uXXXX` 이스케이프 |
| PowerShell Set-Content으로 파일 수정 | replace_string_in_file / create_file |
| tailwind.config.js 생성 | 불필요 — v4는 자동 감지 |
| pnpm / yarn | npm |
| 클래스 컴포넌트 | 함수형 컴포넌트 + Hooks |
