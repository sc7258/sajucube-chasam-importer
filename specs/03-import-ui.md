# Spec 03 — 파일 임포트 화면 (ImportPage)

## 파일 위치

`src/pages/ImportPage.tsx`

## 라우트

`/` (루트)

## 목적

- 차샘 export 파일을 읽고 변환 결과를 첫 화면에서 빠르게 검토한다.
- 사용자 ID를 확인한 뒤에만 검토 단계로 이동할 수 있다.
- 전체 결과 중 일부만 선택해서 ReviewPage로 넘길 수 있다.

## 현재 화면 구성

- 상단 제목/설명
- `UserIdInput` 사용자 검증 영역
- 파일 드래그앤드롭 또는 클릭 업로드 영역
- 병합 검토 안내 배너
- 변환 결과 요약 바
- 이름순 정렬 토글
- 선택 건수 표시
- "다음 단계: 검토하기" 버튼
- 선택 체크박스가 있는 미리보기 테이블

## 주요 상태 (State)

```typescript
const [rawRecords, setRawRecords] = useState<ChasamRecord[]>([]);
const [batchResult, setBatchResult] = useState<BatchConversionResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [parseError, setParseError] = useState<string | null>(null);
const [createdBy, setCreatedBy] = useState('');
const [createdByNickname, setCreatedByNickname] = useState('');
const [isUserVerified, setIsUserVerified] = useState(false);
const [sortByName, setSortByName] = useState(true);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

## 동작 흐름

1. `UserIdInput`에서 전화번호 기반 사용자 확인
2. 파일 드래그앤드롭 또는 클릭 업로드
3. `parseChasamJson()` → `convertBatch(records, createdBy)` 실행
4. 결과를 상태에 저장하고 기본적으로 전체 행을 선택
5. 테이블에서 개별 행 또는 전체 선택/해제
6. "다음 단계: 검토하기" 클릭
7. 선택된 결과만 필터링하여 `/review`로 전달

## 현재 정렬/선택 규칙

- 기본 정렬은 `sortByName=true` 상태의 이름순
- 체크박스로 개별 선택 가능
- 헤더 체크박스는 전체 선택/해제 + indeterminate 상태 지원
- 선택 건수가 0이면 검토 버튼 비활성화
- 사용자 확인이 되지 않으면 검토 버튼 비활성화

## 표시 정보

- 차샘과 saju-cube의 중복 관리 차이에 대한 안내 문구
- 총 건수 / OK / 경고 / 오류
- 선택 건수
- 이름, 생년월일, 양력/음력, 원본 일주, 상태
- 경고/오류 상태 색상
- 사용자 미확인 시 안내 문구

## 에러 표시

- JSON 파싱 실패: 드롭존 아래 빨간 에러 메시지
- 빈 배열: "변환할 데이터가 없습니다"

## ReviewPage로 전달되는 값

```typescript
navigate('/review', {
  state: {
    batchResult: filteredBatch,
    rawRecords: filteredRaw,
    createdBy,
    createdByNickname,
  },
})
```

## 현재 문서상 주의점

- 예전 문서처럼 "createdBy만 입력하면 됨"이 아니라, 지금은 사용자 확인 완료 상태가 필요하다.
- 예전 문서처럼 전체 결과를 무조건 ReviewPage로 넘기지 않는다.
- Import 단계에서 이미 일부 행을 제외할 수 있다.
