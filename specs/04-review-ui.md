# Spec 04 — 검토 화면 (ReviewPage)

## 파일 위치

`src/pages/ReviewPage.tsx`

## 라우트

`/review`

## 화면 구성

```
┌────────────────────────────────────────────────────┐
│  ← 뒤로   검토 및 저장                              │
│                                                    │
│  [탭: 전체(NNN) | ⚠️ 경고(NN) | ❌ 오류(NN) | 🔗 쌍(NN)]│
│                                                    │
│  [경고 탭 선택 시]                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⚠️ 신동국 (1966.03.15)                        │  │
│  │    birthdayType 'N' 감지 — 양력으로 처리됨    │  │
│  │    [수정] [이대로 유지]                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [쌍(S/L) 탭 선택 시]                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ 신재윤 (양력 1972.01.26) ↔ 신재윤2 (음력)     │  │
│  │ 같은 사람으로 병합? [예, 병합] [별도 유지]    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  저장 방식:                                   │  │
│  │  ○ Supabase에 직접 저장                       │  │
│  │  ○ JSON 파일로 내보내기                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│              [저장 실행]  (NNN건)                  │
└────────────────────────────────────────────────────┘
```

## 탭 구성

| 탭 | 내용 |
|---|---|
| 전체 | 모든 변환 결과 목록 |
| 경고 | `status: 'warning'` 레코드 목록 + 경고 메시지 |
| 오류 | `status: 'error'` 레코드 목록 (저장 제외됨) |
| 쌍 감지 | `detectPairs()` 결과 — 병합/별도유지 선택 |

## 쌍 처리 (Pair Deduplication)

병합 선택 시:
- S 레코드(양력)를 기준 `MinimalPersonData`로 사용
- L 레코드(음력)는 별도 저장하지 않음
- (향후 확장: L 레코드를 `additionalDates`의 특정 라벨로 연결)

별도 유지 선택 시:
- S, L 각각 독립 레코드로 저장

## 저장 방식

### Supabase 직접 저장
- `src/utils/api.ts` 의 `addPerson()` 함수 호출
- 성공/실패 건별로 결과 표시
- 완료 후 결과 요약 모달 표시

### JSON 파일 내보내기
- `MinimalPersonData[]` → JSON.stringify → Blob download
- 파일명: `chasam-import-YYYYMMDD.json`

## 저장 결과 요약 모달

```
저장 완료
✅ 성공: NNN건
❌ 실패: NN건 (목록 보기)
```

## 상태 (State)

```typescript
const [activeTab, setActiveTab] = useState<'all'|'warning'|'error'|'pairs'>('all');
const [pairDecisions, setPairDecisions] = useState<Record<string, 'merge'|'separate'>>({});
const [saveMode, setSaveMode] = useState<'supabase'|'json'>('json');
const [isSaving, setIsSaving] = useState(false);
const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
```
