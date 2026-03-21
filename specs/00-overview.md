# 차샘 만세력 Importer — 프로젝트 개요

## 목적

차샘 만세력 앱에서 내보낸 JSON 파일을 읽어,
saju-cube의 `MinimalPersonData` 형식으로 변환하고 Supabase에 저장하는 웹 도구.

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + Vite 6 |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS v4 |
| 라우팅 | react-router v7 |
| 백엔드 | Supabase JS SDK (saju-cube 동일 프로젝트) |
| 패키지 매니저 | pnpm |

## 계산 로직 출처

아래 파일은 saju-cube 프로젝트에서 그대로 복사해 `src/utils/`에 배치한다.
import 경로만 `@/app/...` → `@/...`로 수정.

| 파일 | 역할 |
|---|---|
| `calculationModule.ts` | 핵심 사주 계산 (`sydtoso24yd`, `lunartosolar`, `solortolunar`) |
| `dateCalculation.ts` | 6개 명식 날짜 자동 계산 (`calculateAutoDates`) |
| `sajuDetailCalculator.ts` | 사주 상세 계산 (`calculateSingleSajuSet`) |
| `daewoonCalculator.ts` | 대운 계산 |
| `monthGanjiCalculator.ts` | 월간지 계산 |
| `elementColors.ts` | 오행 색상 |
| `labelMapping.ts` | 본원±라벨 매핑 |

## 주요 화면 3개

```
/ (root)       → ImportPage    : JSON 파일 업로드 + 변환 미리보기
/review        → ReviewPage    : 검토, 경고 확인, 탈중복
/manual        → ManualInputPage : 수동 1건 입력
```

## 워크플로우

```
① 차샘 만세력 앱에서 DB 내보내기 (JSON 파일)
        ↓
② ImportPage: 파일 드래그앤드롭 → 파싱 → 변환 미리보기
        ↓
③ ReviewPage: 경고 항목 확인 (N타입, 음력 윤달, 일주 불일치)
              쌍 레코드(S/L) 탈중복 처리
        ↓
④ Supabase POST /persons 또는 JSON 파일 내보내기
```

## 차샘 DB 파일 예시

```json
[
  {
    "id": "56975a2f-...",
    "sex": "M",
    "name": "신재윤",
    "birthYear": 1972, "birthMonth": 1, "birthDay": 26,
    "birthdayType": "S",
    "birthHour": 11, "birthMinute": 30,
    "birthDateTime": "197201261130",
    "memo": "",
    "ilju": "병진",
    "iljuHanja": "丙辰"
  }
]
```

## birthdayType 코드표

| 값 | 의미 | isLunar 처리 |
|---|---|---|
| `"S"` | 양력 (Solar) | `false` |
| `"L"` | 음력 (Lunar) | `true` |
| `"N"` | 미상 (1건 확인) | `false` + 경고 출력 |

## 환경 변수 (.env)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
saju-cube의 동일한 Supabase 프로젝트 값을 사용.
