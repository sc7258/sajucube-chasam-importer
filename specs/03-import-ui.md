# Spec 03 — 파일 임포트 화면 (ImportPage)

## 파일 위치

`src/pages/ImportPage.tsx`

## 라우트

`/` (루트)

## 화면 구성

```
┌────────────────────────────────────────────────────┐
│  차샘 만세력 Importer                               │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │   📁 JSON 파일을 드래그하거나 클릭해서 선택   │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [파싱 완료 시: 미리보기 테이블 표시]               │
│                                                    │
│  총 NNN건 | ✅ OK: NNN | ⚠️ 경고: NNN | ❌ 오류: NNN │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ # │ 이름 │ 생년월일 │ 음양력 │ 일주(원본) │ 상태│  │
│  │ 1 │ 신재윤│1972.01.26│ 양력  │ 병진      │ ✅  │  │
│  │ 2 │ 길희진│1973.09.20│ 양력  │ 기미      │ ✅  │  │
│  │...│       │          │       │           │     │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│              [다음 단계: 검토하기 →]                │
└────────────────────────────────────────────────────┘
```

## 상태 (State)

```typescript
const [file, setFile] = useState<File | null>(null);
const [rawRecords, setRawRecords] = useState<ChasamRecord[]>([]);
const [batchResult, setBatchResult] = useState<BatchConversionResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [parseError, setParseError] = useState<string | null>(null);
const [createdBy, setCreatedBy] = useState('');  // 사용자 ID 입력
```

## 동작 흐름

1. 파일 드래그앤드롭 또는 클릭 → `<input type="file" accept=".json">`
2. `FileReader.readAsText()` → `parseChasamJson()` 호출
3. `convertBatch(records, createdBy)` 호출
4. 결과를 `batchResult` state에 저장
5. 테이블 렌더링:
   - 상태 컬럼: `✅ ok`, `⚠️ warning`, `❌ error`
   - 경고 있는 행은 노란 배경
   - 오류 행은 빨간 배경
6. "다음 단계" 버튼 클릭 → `/review`로 이동 (batchResult를 상태로 전달)

## 컴포넌트 분리

- `<DropZone>` — 드래그앤드롭 영역
- `<SummaryBar>` — 총계 표시 바
- `<PreviewTable>` — 변환 결과 테이블

## 에러 표시

- JSON 파싱 실패: 드롭존 아래 빨간 에러 메시지
- 빈 배열: "변환할 데이터가 없습니다"

## createdBy 입력

페이지 상단에 작은 텍스트 입력:
```
사용자 ID: [____________] (saju-cube 로그인 ID)
```
비어 있으면 "다음 단계" 버튼 비활성화.
