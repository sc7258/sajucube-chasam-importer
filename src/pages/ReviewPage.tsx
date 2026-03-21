import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  detectPairs,
  type BatchConversionResult,
  type ChasamRecord,
  type ConversionResult,
  type MinimalPersonData,
} from '@/utils/chasamConverter'
import { postPerson } from '@/utils/sajuCubeAuth'

// ── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'warning' | 'error' | 'pairs'
type Stage = 'list' | 'confirm' | 'saving' | 'done'
type SaveMode = 'json' | 'supabase'
interface SaveResult { success: number; failed: number; failedNames: string[] }

// ── HOUR_OPTIONS ──────────────────────────────────────────────────────────────

const HOUR_OPTIONS = [
  { label: '자시 (23-01)', value: 0 }, { label: '축시 (01-03)', value: 2 },
  { label: '인시 (03-05)', value: 4 }, { label: '묘시 (05-07)', value: 6 },
  { label: '진시 (07-09)', value: 8 }, { label: '사시 (09-11)', value: 10 },
  { label: '오시 (11-13)', value: 12 }, { label: '미시 (13-15)', value: 14 },
  { label: '신시 (15-17)', value: 16 }, { label: '유시 (17-19)', value: 18 },
  { label: '술시 (19-21)', value: 20 }, { label: '해시 (21-23)', value: 22 },
]

// ── PersonCard ────────────────────────────────────────────────────────────────

interface PersonCardProps {
  p: MinimalPersonData
  result: ConversionResult | undefined
  deleteConfirmId: string | null
  onEdit: (p: MinimalPersonData) => void
  onDeleteStart: (id: string) => void
  onDeleteCancel: () => void
  onDeleteConfirm: (id: string) => void
}

function PersonCard({ p, result, deleteConfirmId, onEdit, onDeleteStart, onDeleteCancel, onDeleteConfirm }: PersonCardProps) {
  const bd = p.birthDate
  const isWarning = result?.status === 'warning'
  const isDeleting = deleteConfirmId === p.id

  return (
    <div className={`border-b last:border-0 px-4 py-3 ${isWarning ? 'bg-yellow-50' : 'bg-white'}`}>
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5 shrink-0">{isWarning ? '\u26a0\ufe0f' : '\u2705'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{p.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
              {p.gender === 'male' ? '남' : '여'}
            </span>
            <span className="text-sm text-gray-500">
              {bd.year}.{String(bd.month).padStart(2, '0')}.{String(bd.day).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400">({bd.isLunar ? '음력' : '양력'})</span>
            {bd.hour !== undefined && (
              <span className="text-xs text-gray-400">{bd.hour}시{bd.minute ? ` ${bd.minute}분` : ''}</span>
            )}
          </div>
          {p.occupation && <p className="text-xs text-gray-500 mt-0.5">{p.occupation}</p>}
          {p.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.notes}</p>}
          {result?.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 mt-0.5">{'\u26a0'} {w}</p>
          ))}
          {result && !result.iljuValid && (
            <p className="text-xs text-red-500 mt-0.5">
              일주 불일치: 원본 &quot;{result.originalIlju}&quot; → 계산 &quot;{result.calculatedIlju}&quot;
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 items-center">
          {!isDeleting && (
            <button
              onClick={() => onEdit({ ...p })}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >수정</button>
          )}
          {isDeleting ? (
            <>
              <button onClick={() => onDeleteConfirm(p.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600">확인</button>
              <button onClick={onDeleteCancel} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">취소</button>
            </>
          ) : (
            <button
              onClick={() => onDeleteStart(p.id)}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >삭제</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── EditModal ─────────────────────────────────────────────────────────────────

function EditModal({ person, onSave, onClose }: {
  person: MinimalPersonData
  onSave: (p: MinimalPersonData) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState({ ...person, birthDate: { ...person.birthDate } })

  function set<K extends keyof MinimalPersonData>(key: K, val: MinimalPersonData[K]) {
    setDraft(d => ({ ...d, [key]: val }))
  }
  function setBD<K extends keyof MinimalPersonData['birthDate']>(key: K, val: MinimalPersonData['birthDate'][K]) {
    setDraft(d => ({ ...d, birthDate: { ...d.birthDate, [key]: val } }))
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mt-10 mb-10 p-6 space-y-4">
        <h3 className="text-lg font-semibold">사람 정보 수정</h3>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-gray-700">이름</span>
            <input type="text" value={draft.name} onChange={e => set('name', e.target.value)}
              className="mt-1 w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </label>

          <div className="text-sm">
            <span className="font-medium text-gray-700">성별</span>
            <div className="flex gap-4 mt-1">
              {(['male', 'female'] as const).map(g => (
                <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={draft.gender === g} onChange={() => set('gender', g)} className="accent-blue-600" />
                  {g === 'male' ? '남성' : '여성'}
                </label>
              ))}
            </div>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-700">생년월일</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <input type="number" value={draft.birthDate.year} onChange={e => setBD('year', +e.target.value)}
                placeholder="연도" className="border rounded px-3 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="number" value={draft.birthDate.month} onChange={e => setBD('month', +e.target.value)}
                min={1} max={12} placeholder="월" className="border rounded px-3 py-1.5 text-sm w-14 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="number" value={draft.birthDate.day} onChange={e => setBD('day', +e.target.value)}
                min={1} max={31} placeholder="일" className="border rounded px-3 py-1.5 text-sm w-14 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <div className="flex gap-3 ml-1">
                {[{ v: false, label: '양력' }, { v: true, label: '음력' }].map(opt => (
                  <label key={String(opt.v)} className="flex items-center gap-1 cursor-pointer text-sm">
                    <input type="radio" checked={draft.birthDate.isLunar === opt.v} onChange={() => setBD('isLunar', opt.v)} className="accent-blue-600" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-700">생시</span>
            <div className="flex items-center gap-2 mt-1">
              <select value={draft.birthDate.hour} onChange={e => setBD('hour', +e.target.value)}
                className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="number" value={draft.birthDate.minute ?? 0} onChange={e => setBD('minute', +e.target.value)}
                min={0} max={59} placeholder="분"
                className="border rounded px-3 py-1.5 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <span className="text-xs text-gray-400">분</span>
            </div>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">직업/키워드</span>
            <input type="text" value={draft.occupation ?? ''} onChange={e => set('occupation', e.target.value || undefined)}
              className="mt-1 w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">메모</span>
            <textarea value={draft.notes ?? ''} onChange={e => set('notes', e.target.value || undefined)}
              rows={2} className="mt-1 w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </label>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">취소</button>
          <button onClick={() => onSave(draft)} className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700">저장</button>
        </div>
      </div>
    </div>
  )
}

// ── ReviewPage ────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { batchResult, rawRecords } = (location.state ?? {}) as {
    batchResult: BatchConversionResult | undefined
    rawRecords: ChasamRecord[] | undefined
  }

  // mutable editable list (errors excluded from the start)
  const [persons, setPersons] = useState<MinimalPersonData[]>(() =>
    batchResult ? batchResult.results.filter(r => r.status !== 'error').map(r => r.data) : []
  )
  const [editingPerson, setEditingPerson] = useState<MinimalPersonData | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [stage, setStage] = useState<Stage>('list')
  const [saveMode, setSaveMode] = useState<SaveMode>('json')
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null)

  const pairs = useMemo(() => (rawRecords ? detectPairs(rawRecords) : []), [rawRecords])
  const pairsWithMatch = pairs.filter(p => p.isPair)

  const resultMap = useMemo(() => {
    const m = new Map<string, ConversionResult>()
    batchResult?.results.forEach(r => m.set(r.data.id, r))
    return m
  }, [batchResult])

  if (!batchResult || !rawRecords) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">데이터가 없습니다. 먼저 파일을 임포트해주세요.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">{'<-'} 임포트 화면으로</button>
      </div>
    )
  }

  const errors = batchResult.results.filter(r => r.status === 'error')
  const warnings = persons.filter(p => resultMap.get(p.id)?.status === 'warning')
  const pairsInList = pairsWithMatch.filter(p =>
    (p.sRecord && persons.some(x => x.id === p.sRecord!.id)) ||
    (p.lRecord && persons.some(x => x.id === p.lRecord!.id))
  )

  function deleteById(id: string) {
    setPersons(prev => prev.filter(p => p.id !== id))
    setDeleteConfirmId(null)
  }

  function updatePerson(updated: MinimalPersonData) {
    setPersons(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditingPerson(null)
  }

  async function handleSave() {
    setStage('saving')
    if (saveMode === 'json') {
      const blob = new Blob([JSON.stringify(persons, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `chasam-import-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`
      a.click(); URL.revokeObjectURL(url)
      setSaveResult({ success: persons.length, failed: 0, failedNames: [] })
      setStage('done')
      return
    }
    const failedNames: string[] = []
    for (const rec of persons) {
      const ok = await postPerson(rec as unknown as Record<string, unknown>)
      if (!ok) failedNames.push(rec.name)
    }
    setSaveResult({ success: persons.length - failedNames.length, failed: failedNames.length, failedNames })
    setStage('done')
  }

  // ── Stage: done ──────────────────────────────────────────────────────────

  if (stage === 'done' && saveResult) {
    const allOk = saveResult.failed === 0
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold">저장 완료</h2>
        <div className={`rounded-lg px-6 py-5 border ${allOk ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
          <p className="font-semibold text-base mb-2">{allOk ? '\u2705 모두 저장되었습니다' : '\u26a0\ufe0f 일부 실패'}</p>
          <p className="text-sm">성공: <strong>{saveResult.success}</strong>건</p>
          {saveResult.failed > 0 && (
            <p className="text-sm mt-1">실패: <strong>{saveResult.failed}</strong>건 ({saveResult.failedNames.join(', ')})</p>
          )}
        </div>
        <button onClick={() => navigate('/')} className="text-blue-600 underline text-sm">{'<-'} 처음부터 다시</button>
      </div>
    )
  }

  // ── Stage: saving ────────────────────────────────────────────────────────

  if (stage === 'saving') {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-500 text-lg animate-pulse">저장 중... ({persons.length}건)</p>
      </div>
    )
  }

  // ── Stage: confirm ───────────────────────────────────────────────────────

  if (stage === 'confirm') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStage('list')} className="text-blue-600 hover:underline text-sm">{'<-'} 리스트로</button>
          <h2 className="text-xl font-semibold">저장 확인</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 font-medium">
          저장 예정 <strong>{persons.length}</strong>건
          {errors.length > 0 && <span className="font-normal text-blue-500"> (오류 {errors.length}건 제외됨)</span>}
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-sm">저장 방식</h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="saveMode" checked={saveMode === 'json'} onChange={() => setSaveMode('json')} className="accent-blue-600" />
            JSON 파일로 내보내기
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="saveMode" checked={saveMode === 'supabase'} onChange={() => setSaveMode('supabase')} className="accent-blue-600" />
            saju-cube에 직접 저장
          </label>
          {saveMode === 'supabase' && (
            <p className="pl-5 text-xs text-gray-500">createdBy에 설정된 전화번호 ID로 저장됩니다.</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">저장할 목록</h3>
          <div className="border rounded-lg overflow-hidden">
            {persons.map((p, i) => {
              const bd = p.birthDate
              const result = resultMap.get(p.id)
              return (
                <div key={p.id} className="border-b last:border-0 px-4 py-2.5 flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-6 text-right shrink-0">{i + 1}</span>
                  <span className="font-medium">{p.name}</span>
                  <span className={`text-xs px-1 rounded shrink-0 ${p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {p.gender === 'male' ? '남' : '여'}
                  </span>
                  <span className="text-gray-500">{bd.year}.{String(bd.month).padStart(2, '0')}.{String(bd.day).padStart(2, '0')}</span>
                  <span className="text-gray-400 text-xs">({bd.isLunar ? '음력' : '양력'})</span>
                  {p.occupation && <span className="text-gray-400 text-xs truncate hidden sm:block">{p.occupation}</span>}
                  <span className="ml-auto shrink-0">{result?.status === 'warning' ? '\u26a0\ufe0f' : '\u2705'}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            저장 실행 ({persons.length}건)
          </button>
        </div>
      </div>
    )
  }

  // ── Stage: list ──────────────────────────────────────────────────────────

  const FILTER_TABS = [
    { id: 'all' as FilterTab, label: '전체', count: persons.length },
    { id: 'warning' as FilterTab, label: '\u26a0\ufe0f 경고', count: warnings.length },
    { id: 'error' as FilterTab, label: '\u274c 오류 (제외)', count: errors.length },
    { id: 'pairs' as FilterTab, label: '\uD83D\uDD17 쌍 감지', count: pairsInList.length },
  ]

  const filteredPersons = filterTab === 'warning' ? warnings : filterTab === 'all' ? persons : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">{'<-'} 뒤로</button>
          <h2 className="text-xl font-semibold">검토</h2>
        </div>
        <button
          onClick={() => setStage('confirm')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          저장 목록 확인 ({persons.length}건) {'->'}
        </button>
      </div>

      <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
        <span>임포트 <strong className="text-gray-800">{batchResult.totalCount}</strong>건</span>
        <span>·</span>
        <span>저장 대상 <strong className="text-green-700">{persons.length}</strong>건</span>
        {errors.length > 0 && <><span>·</span><span className="text-red-500">오류 제외 {errors.length}건</span></>}
      </div>

      <div className="flex gap-0 border-b">
        {FILTER_TABS.map(tab => (
          <button key={tab.id} onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filterTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        {(filterTab === 'all' || filterTab === 'warning') && (
          filteredPersons.length === 0
            ? <p className="px-4 py-8 text-center text-gray-400">항목 없음</p>
            : filteredPersons.map(p => (
              <PersonCard key={p.id} p={p} result={resultMap.get(p.id)}
                deleteConfirmId={deleteConfirmId}
                onEdit={setEditingPerson}
                onDeleteStart={setDeleteConfirmId}
                onDeleteCancel={() => setDeleteConfirmId(null)}
                onDeleteConfirm={deleteById}
              />
            ))
        )}

        {filterTab === 'error' && (
          errors.length === 0
            ? <p className="px-4 py-8 text-center text-gray-400">오류 없음</p>
            : errors.map(r => (
              <div key={r.data.id} className="border-b last:border-0 px-4 py-3 bg-red-50">
                <div className="flex items-center gap-2">
                  <span>{'\u274c'}</span>
                  <span className="font-medium">{r.data.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">저장 제외됨</span>
                </div>
                {r.warnings.map((w, i) => <p key={i} className="text-xs text-red-600 mt-1 pl-6">{w}</p>)}
              </div>
            ))
        )}

        {filterTab === 'pairs' && (
          pairsInList.length === 0
            ? <p className="px-4 py-8 text-center text-gray-400">감지된 쌍 없음</p>
            : pairsInList.map(pair => (
              <div key={pair.key} className="border-b last:border-0 px-4 py-4">
                <p className="text-xs text-gray-500 mb-2">같은 사람으로 추정 (음력 중복 레코드)</p>
                <div className="flex flex-wrap items-center gap-3">
                  {pair.sRecord && persons.some(p => p.id === pair.sRecord!.id) && (
                    <div className="text-sm">
                      <strong>{pair.sRecord.name}</strong>
                      <span className="ml-1 text-xs text-gray-400">(양력, 유지)</span>
                    </div>
                  )}
                  {pair.lRecord && persons.some(p => p.id === pair.lRecord!.id) && (
                    <>
                      <span className="text-gray-300">--</span>
                      <div className="text-sm">
                        <strong>{pair.lRecord.name}</strong>
                        <span className="ml-1 text-xs text-gray-400">(음력)</span>
                      </div>
                      <button
                        onClick={() => deleteById(pair.lRecord!.id)}
                        className="text-xs px-2.5 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                      >음력 삭제 (병합)</button>
                    </>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {editingPerson && (
        <EditModal person={editingPerson} onSave={updatePerson} onClose={() => setEditingPerson(null)} />
      )}
    </div>
  )
}
