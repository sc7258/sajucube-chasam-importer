# 차샘 만세력 Importer — 프로젝트 개요

## 목적

차샘 만세력 앱에서 내보낸 JSON 데이터를 읽어 `saju-cube`의 `MinimalPersonData` 형식으로 변환하고,
사용자가 검토한 뒤 JSON으로 내보내거나 saju-cube 백엔드에 직접 저장하는 독립 웹 도구.

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + Vite 6 |
| 언어 | TypeScript strict mode |
| 스타일 | Tailwind CSS v4 |
| 라우팅 | `react-router` v7 |
| 패키지 매니저 | `npm` |
| API 연동 | `src/utils/sajuCubeAuth.ts`를 통한 HTTP 호출 |

## 계산 로직 출처

아래 파일은 `saju-cube`에서 가져와 `src/utils/`에 두고 사용한다.
대부분 경로 조정 위주이며, 계산 로직은 원본과 최대한 동일하게 유지한다.

| 파일 | 역할 |
|---|---|
| `calculationModule.ts` | 핵심 사주 계산 (`sydtoso24yd`, `lunartosolar`, `solortolunar`) |
| `dateCalculation.ts` | 6개 명식 날짜 자동 계산 (`calculateAutoDates`) |
| `daewoonCalculator.ts` | 대운 계산 |
| `monthGanjiCalculator.ts` | 월간지 계산 |
| `elementColors.ts` | 오행 색상 |
| `labelMapping.ts` | 라벨 매핑 |
| `types/Person.ts` | saju-cube Person 타입 참조용 복사본 |

## 주요 화면

```
/         → ImportPage        : 파일 업로드, 사용자 검증, 변환 미리보기, 선택 후 검토 이동
/review   → ReviewPage        : 경고/오류 검토, 병합 그룹 확인, 수정/삭제, JSON 또는 DB 저장
/manual   → ManualInputPage   : 1건 수동 입력, 중복 확인, JSON 생성 또는 DB 저장
```

## 현재 워크플로우

```
① 차샘 앱에서 DB export
        ↓
② ImportPage
   - 사용자 ID 확인
   - 파일 파싱
   - batch 변환 결과 미리보기
   - 저장/검토할 행 선택
        ↓
③ ReviewPage
   - 전체/경고/오류/그룹 병합 탭 검토
   - 필요 시 개별 레코드 수정/삭제
   - JSON 생성 또는 saju-cube DB 저장
   - DB 저장 시 split payload 검증 결과 확인
        ↓
④ 후속 정리
   - 성공/실패 건수 확인
   - mismatch 발생 시 이름 목록 확인
```

## 차샘 데이터 특성

| 필드 | 의미 |
|---|---|
| `birthdayType: 'S'` | 양력 생일 |
| `birthdayType: 'L'` | 음력 생일 |
| `birthdayType: 'N'` | 불명확한 입력. 현재는 양력으로 처리하고 경고 추가 |
| `memo` | 차샘 원본 메모. 변환 후 `notes`로 보존 |

## 현재 알려진 주의점

- `birthDate.isLeapMonth`는 현재 대부분 `false`로 저장된다.
- 윤달 여부를 원본에서 직접 알기 어려워 일주 불일치 경고가 생길 수 있다.
- 이름 변형, 양력/음력 중복, 본원/허본 계열 데이터는 `detectVariants()`와 `mergeVariants()` 기준으로 그룹 병합된다.
- 병합 시 `notes`는 합쳐지지만 현재 방식은 단순 문자열 연결이다.

## 문서 읽는 순서

1. 이 문서 (`00-overview.md`)
2. `01-data-mapping.md`
3. `02-converter-module.md`
4. `03-import-ui.md`
5. `04-review-ui.md`
6. `05-manual-input-ui.md`
7. `06-test-scenarios.md`
