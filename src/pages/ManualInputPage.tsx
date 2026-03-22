import { useState } from 'react'
import { calculateAutoDates } from '@/utils/dateCalculation'
import { convertRecord, type ChasamRecord } from '@/utils/chasamConverter'
import { sydtoso24yd, ganji } from '@/utils/calculationModule'
import { postPerson, fetchPersonsByUser, fetchPersonById } from '@/utils/sajuCubeAuth'
import UserIdInput from '@/components/UserIdInput'

/** 키 순서에 무관한 재귀 deep-equal */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== (b as unknown[]).length) return false
    return (a as unknown[]).every((v, i) => deepEqual(v, (b as unknown[])[i]))
  }
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj).sort()
  const bKeys = Object.keys(bObj).sort()
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((k, i) => bKeys[i] === k && deepEqual(aObj[k], bObj[k]))
}

/** 서버 splitPersonData()와 동일한 필드 분리 */
function splitPersonPayload(p: Record<string, unknown>): { person_basic: Record<string, unknown>; person_detail: Record<string, unknown> } {
  const person_basic: Record<string, unknown> = {
    id: p.id,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    createdBy: p.createdBy,
    createdByNickname: p.createdByNickname,
    name: p.name,
    gender: p.gender,
    occupation: p.occupation,
    deathReason: p.deathReason,
    keywords: p.keywords,
    birthDate: p.birthDate,
    additionalDates: p.additionalDates,
    isPrivate: p.isPrivate === true,
  }
  const person_detail: Record<string, unknown> = {
    id: p.id,
    birthPlace: p.birthPlace,
    notes: p.notes,
    referenceLinks: p.referenceLinks,
    relationships: p.relationships,
    familyMemberIds: p.familyMemberIds,
  }
  return { person_basic, person_detail }
}

function timeToSijin(timeStr: string): { label: string; hourValue: number } | null {
  if (!timeStr) return null
  const h = parseInt(timeStr.split(':')[0])
  if (isNaN(h)) return null
  if (h === 23 || h === 0) return { label: '자시 (23\u201301시)', hourValue: 0 }
  if (h <= 2)  return { label: '축시 (01\u201303시)', hourValue: 2 }
  if (h <= 4)  return { label: '인시 (03\u201305시)', hourValue: 4 }
  if (h <= 6)  return { label: '묘시 (05\u201307시)', hourValue: 6 }
  if (h <= 8)  return { label: '진시 (07\u201309시)', hourValue: 8 }
  if (h <= 10) return { label: '사시 (09\u201311시)', hourValue: 10 }
  if (h <= 12) return { label: '오시 (11\u201313시)', hourValue: 12 }
  if (h <= 14) return { label: '미시 (13\u201315시)', hourValue: 14 }
  if (h <= 16) return { label: '신시 (15\u201317시)', hourValue: 16 }
  if (h <= 18) return { label: '유시 (17\u201319시)', hourValue: 18 }
  if (h <= 20) return { label: '술시 (19\u201321시)', hourValue: 20 }
  return { label: '해시 (21\u201323시)', hourValue: 22 }
}

type AutoDate = { label: string; year: number; month: number; day: number }

export default function ManualInputPage() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [isLunar, setIsLunar] = useState(false)
  const [hourUnknown, setHourUnknown] = useState(false)
  const [birthTime, setBirthTime] = useState('12:00')
  const sijin = timeToSijin(birthTime)
  const ampm = birthTime ? (parseInt(birthTime.split(':')[0]) < 12 ? '오전' : '오후') : null
  const [memo, setMemo] = useState('')
  const [createdBy, setCreatedBy] = useState('')
  const [createdByNickname, setCreatedByNickname] = useState('')
  const [isUserVerified, setIsUserVerified] = useState(false)

  const [calcError, setCalcError] = useState<string | null>(null)
  const [autoDates, setAutoDates] = useState<AutoDate[] | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<'match' | 'mismatch' | null>(null)
  const [verifyDiffs, setVerifyDiffs] = useState<string[]>([])
  const [dupInfo, setDupInfo] = useState<{ id: string; name: string; birthDate: string; notes?: string }[] | null>(null)
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null)

  function handleCalc() {
    setCalcError(null); setAutoDates(null)
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || !m || !d) { setCalcError('생년월일을 입력해주세요'); return }
    if (y < 1600 || y > 2100) { setCalcError('연도는 1600~2100 사이여야 합니다'); return }
    if (m < 1 || m > 12) { setCalcError('월은 1~12 사이여야 합니다'); return }
    if (d < 1 || d > 31) { setCalcError('일은 1~31 사이여야 합니다'); return }
    const result = calculateAutoDates(y, m, d)
    if (!result.success || !result.dates) { setCalcError(result.error ?? '날짜 계산 실패'); return }
    setAutoDates(result.dates)
  }

  async function doSave(payload: Record<string, unknown>) {
    setSaveStatus('saving'); setSaveError(null); setVerifyResult(null); setVerifyDiffs([])
    try {
      const ok = await postPerson(payload)
      if (!ok) { setSaveStatus('error'); setSaveError('서버 저장 실패. 서버 응답을 확인해주세요.'); return }
      setSaveStatus('success')

      // Phase 20/21: 저장 직후 서버에서 재조회 → split 결과 자동 비교
      const savedFlat = await fetchPersonById(payload.id as string, payload.createdBy as string)
      if (savedFlat) {
        const clientSplit = splitPersonPayload(payload)
        const serverSplit = splitPersonPayload(savedFlat)
        const diffs: string[] = []
        for (const k of Object.keys(clientSplit.person_basic)) {
          if (!deepEqual(clientSplit.person_basic[k], serverSplit.person_basic[k]))
            diffs.push(`person_basic.${k}: client=${JSON.stringify(clientSplit.person_basic[k])} / server=${JSON.stringify(serverSplit.person_basic[k])}`)
        }
        for (const k of Object.keys(clientSplit.person_detail)) {
          if (!deepEqual(clientSplit.person_detail[k], serverSplit.person_detail[k]))
            diffs.push(`person_detail.${k}: client=${JSON.stringify(clientSplit.person_detail[k])} / server=${JSON.stringify(serverSplit.person_detail[k])}`)
        }
        if (diffs.length > 0) {
          console.warn('[split 검증] 클라이언트↔서버 불일치:', diffs)
          setVerifyResult('mismatch'); setVerifyDiffs(diffs)
        } else {
          console.log('[split 검증] 일치 \u2705')
          setVerifyResult('match'); setVerifyDiffs([])
        }
      }
    } catch (e) {
      setSaveStatus('error')
      setSaveError(e instanceof Error ? e.message : '저장 실패')
    }
  }

  function buildFlatPayload(overrideCreatedBy?: string): Record<string, unknown> | null {
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || !m || !d) return null

    const birthHour   = hourUnknown ? 11 : (sijin?.hourValue ?? 12)
    const birthMinute = hourUnknown ? 0  : (birthTime ? (parseInt(birthTime.split(':')[1]) || 0) : 0)

    const saju = sydtoso24yd(y, m, d, birthHour, birthMinute)
    const dayPillarHanja   = ganji[saju.so24day]
    const monthPillarHanja = ganji[saju.so24month]

    const fakeRecord: ChasamRecord = {
      id: `manual-${Date.now()}`,
      sex: gender,
      name: name.trim(),
      birthYear: y, birthMonth: m, birthDay: d,
      birthdayType: isLunar ? 'L' : 'S',
      birthHour, birthMinute,
      birthDateTime: '', memo, ilju: '', iljuHanja: '',
    }
    const result = convertRecord(fakeRecord, overrideCreatedBy ?? createdBy)

    const additionalDates = (result.data.additionalDates ?? []).map(ad => {
      const adSaju = sydtoso24yd(ad.year, ad.month, ad.day, birthHour, birthMinute)
      return { ...ad, dayPillar: ganji[adSaju.so24day], monthPillar: ganji[adSaju.so24month] }
    })

    return {
      ...result.data,
      createdAt: new Date().toISOString(),
      createdByNickname,
      birthDate: { ...result.data.birthDate, dayPillar: dayPillarHanja, monthPillar: monthPillarHanja },
      additionalDates,
      occupation: '',
      deathReason: '',
      isPrivate: false,
      notes: memo.trim(),
      birthPlace: '',
      referenceLinks: [] as string[],
    }
  }

  function handleDownloadJson() {
    if (!name.trim()) return
    const flat = buildFlatPayload('preview')
    if (!flat) return
    const split = splitPersonPayload(flat)
    const blob = new Blob([JSON.stringify(split, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `manual-${name.trim()}-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  async function handleSave() {
    if (!name.trim() || !createdBy) return
    setSaveError(null)
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || !m || !d) { setSaveStatus('error'); setSaveError('생년월일을 입력해주세요'); return }

    const payload = buildFlatPayload()
    if (!payload) { setSaveStatus('error'); setSaveError('payload 조립 실패'); return }

    // 중복 체크: 같은 createdBy, 이름, 생년월일
    setSaveStatus('saving')
    const existing = await fetchPersonsByUser(createdBy)
    const dups = (existing as Record<string, unknown>[]).filter((p) => {
      const bd = p.birthDate as { year: number; month: number; day: number } | undefined
      return p.name === name.trim() &&
        bd?.year === y && bd?.month === m && bd?.day === d
    })
    setSaveStatus('idle')

    if (dups.length > 0) {
      setDupInfo(dups.map((p) => {
        const bd = p.birthDate as { year: number; month: number; day: number }
        return {
          id: p.id as string,
          name: p.name as string,
          birthDate: `${bd.year}.${String(bd.month).padStart(2,'0')}.${String(bd.day).padStart(2,'0')}`,
          notes: (p.notes || (p.person_detail as Record<string, unknown> | undefined)?.notes || undefined) as string | undefined,
        }
      }))
      setPendingPayload(payload)
      return
    }

    await doSave(payload)
  }

  const canCalc = year && month && day

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">수동 입력</h2>

      {/* 사용자 ID */}
      <UserIdInput value={createdBy} onChange={setCreatedBy} onNicknameChange={setCreatedByNickname} onValidChange={setIsUserVerified} />

      {/* 이름 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 w-32">이름 <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
          className="border rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 성별 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 w-32">성별 <span className="text-red-500">*</span></label>
        <div className="flex gap-4">
          {(['M','F'] as const).map(g => (
            <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="radio" checked={gender === g} onChange={() => setGender(g)} className="accent-blue-600" />
              {g === 'M' ? '남성' : '여성'}
            </label>
          ))}
        </div>
      </div>

      {/* 생년월일 */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700 w-32">생년월일 <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-2">
          <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="연도" min={1600} max={2100}
            className="border rounded px-3 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="월" min={1} max={12}
            className="border rounded px-3 py-1.5 text-sm w-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="일" min={1} max={31}
            className="border rounded px-3 py-1.5 text-sm w-14 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-3 ml-1">
            {[{v:false,label:'양력'},{v:true,label:'음력'}].map(opt => (
              <label key={String(opt.v)} className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="radio" checked={isLunar === opt.v} onChange={() => setIsLunar(opt.v)} className="accent-blue-600" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 생시 */}
      <div className="flex items-start gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700 w-32 pt-1.5">생시</label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
              disabled={hourUnknown}
              className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            {!hourUnknown && ampm && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                ampm === '오전' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {ampm}
              </span>
            )}
            {!hourUnknown && sijin && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {sijin.label}
              </span>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600">
            <input type="checkbox" checked={hourUnknown} onChange={e => setHourUnknown(e.target.checked)} className="accent-blue-600" />
            시간 모름
          </label>
        </div>
      </div>

      {/* 메모 */}
      <div className="flex items-start gap-3">
        <label className="text-sm font-medium text-gray-700 w-32 pt-1.5">메모</label>
        <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2}
          className="border rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
      </div>

      {/* 계산 버튼 */}
      <div>
        <button onClick={handleCalc} disabled={!canCalc}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          6개 명식 날짜 계산하기
        </button>
        {calcError && <p className="text-sm text-red-600 mt-2">{calcError}</p>}
      </div>

      {/* 명식 미리보기 */}
      {autoDates && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">6개 명식 날짜</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[...autoDates].sort((a, b) =>
              a.year !== b.year ? a.year - b.year :
              a.month !== b.month ? a.month - b.month :
              a.day - b.day
            ).map(d => (
              <div key={d.label} className="border rounded-lg p-2 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">{d.label}</div>
                <div className="text-sm font-mono">{d.year}.{String(d.month).padStart(2,'0')}.{String(d.day).padStart(2,'0')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 중복 확인 모달 */}
      {dupInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">중복 데이터 감지</h3>
            <p className="text-sm text-gray-600">
              이미 같은 사람의 자료가 {dupInfo!.length}건 존재합니다.
            </p>
            <div className="flex flex-col gap-2">
              {dupInfo!.map((d, i) => (
                <div key={d.id} className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
                  {dupInfo!.length > 1 && <div className="text-xs text-gray-400 mb-1">{i + 1}번째</div>}
                  <div><span className="text-gray-500">이름:</span> <span className="font-medium">{d.name}</span></div>
                  <div><span className="text-gray-500">생년월일:</span> <span className="font-medium">{d.birthDate}</span></div>
                  {d.notes && <div className="text-xs text-gray-500 mt-1">메모: {d.notes}</div>}
                  <div className="text-xs text-gray-400 mt-1">ID: {d.id}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">그래도 새로 저장하시겠습니까?</p>
            <div className="flex gap-2 justify-end flex-wrap">
              <button
                onClick={() => { setDupInfo(null); setPendingPayload(null) }}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
              >
                취소
              </button>
              {dupInfo!.length === 1 && (
                <button
                  onClick={() => {
                    const p = pendingPayload
                    const existingNotes = dupInfo![0].notes
                    const mergedNotes = [existingNotes, memo.trim()].filter(Boolean).join(' / ')
                    setDupInfo(null); setPendingPayload(null)
                    if (p) doSave({ ...p, notes: mergedNotes })
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white font-medium hover:bg-green-700"
                >
                  메모 병합 후 저장
                </button>
              )}
              <button
                onClick={() => { const p = pendingPayload; setDupInfo(null); setPendingPayload(null); if (p) doSave(p) }}
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                그냥 새로 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장 결과 */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          saju-cube DB에 저장되었습니다.{verifyResult === 'match' && ' 생성된 json과 일치합니다.'}
        </div>
      )}
      {saveStatus === 'success' && verifyResult === 'mismatch' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
          {'\u26a0\ufe0f'} split 불일치 ({verifyDiffs.length}건): {verifyDiffs[0]}{verifyDiffs.length > 1 ? ' ...' : ''}
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={handleDownloadJson}
          disabled={!name.trim() || !year || !month || !day}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          JSON 생성
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !isUserVerified || saveStatus === 'saving'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {saveStatus === 'saving' ? '저장 중...' : 'DB에 저장'}
        </button>
      </div>
    </div>
  )
}
