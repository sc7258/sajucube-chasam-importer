# Spec 04 — 검토 화면 (ReviewPage)

## 파일 위치

`src/pages/ReviewPage.tsx`

## 라우트

`/review`

## 목적

- 변환된 사람 목록을 최종 검토한다.
- 경고/오류/병합 그룹을 나눠서 확인한다.
- 필요 시 개별 인물을 수정하거나 제거한다.
- JSON 생성 또는 DB 저장을 실행한다.

## 탭 구성

| 탭 | 내용 |
|---|---|
| 전체 | 모든 변환 결과 목록 |
| 경고 | `status: 'warning'` 레코드 목록 + 경고 메시지 |
| 오류 | `status: 'error'` 레코드 목록 (저장 제외됨) |
| 그룹 병합 | `detectVariants()` + `mergeVariants()` 결과 요약 |

## 현재 병합 처리 방식

- ReviewPage 진입 시 이미 `mergeVariants()`가 적용된 `persons` 목록을 사용한다.
- 병합된 그룹은 "그룹 병합" 탭에서 대표/흡수 레코드 정보를 보여준다.
- 현재 메모 병합은 대표 `notes` + 흡수 `notes`를 `' / '`로 연결하는 방식이다.
- 사용자가 병합 여부를 탭에서 일일이 선택하는 구조는 현재 없다.

## 저장 방식

### Supabase 직접 저장
- `src/utils/sajuCubeAuth.ts`의 `postPerson()` 사용
- 각 건 저장 후 `fetchPersonById()`로 재조회
- 클라이언트 split payload와 서버 저장 결과를 비교
- mismatch가 있으면 완료 화면에 이름 목록 표시

### JSON 파일 내보내기
- split 포맷 배열로 JSON 생성
- `[{ person_basic, person_detail }]` 형식으로 다운로드
- 파일명: `chasam-import-YYYYMMDD.json`

## 단계 (Stage)

| Stage | 의미 |
|---|---|
| `list` | 기본 검토 화면 |
| `confirm` | 저장 방식 선택 및 최종 확인 |
| `saving` | 저장 실행 중 |
| `done` | 결과 요약 표시 |

## 주요 상태 (State)

```typescript
const [persons, setPersons] = useState<MinimalPersonData[]>(...);
const [filterTab, setFilterTab] = useState<'all'|'warning'|'error'|'groups'>('all');
const [sortByName, setSortByName] = useState(false);
const [stage, setStage] = useState<'list'|'confirm'|'saving'|'done'>('list');
const [saveMode, setSaveMode] = useState<'supabase'|'json'>('json');
const [saveResult, setSaveResult] = useState<{
  success: number;
  failed: number;
  failedNames: string[];
  mismatchNames: string[];
} | null>(null);
```

## 현재 UI에서 확인 가능한 것

- 경고 레코드의 warning 메시지
- 일주 불일치 메시지
- 수정/삭제
- 이름순 정렬 토글
- 병합 그룹 수와 병합된 이름 목록
- 저장 성공/실패 건수
- split mismatch 이름 목록

## 현재 문서상 주의점

- 예전 `쌍 감지`와 `pairDecisions` 설명은 현재 구현과 다르다.
- 현재 저장 결과는 단순 성공/실패뿐 아니라 split 검증 mismatch까지 함께 본다.
- JSON도 단순 flat array가 아니라 split payload 기준으로 생성된다.
