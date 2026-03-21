import { useState } from 'react'
import { calculateAutoDates } from '@/utils/dateCalculation'
import { convertRecord, type ChasamRecord } from '@/utils/chasamConverter'
import { sydtoso24yd, ganji } from '@/utils/calculationModule'
import { postPerson } from '@/utils/sajuCubeAuth'
import UserIdInput from '@/components/UserIdInput'

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

  const [calcError, setCalcError] = useState<string | null>(null)
  const [autoDates, setAutoDates] = useState<AutoDate[] | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

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

  async function handleSave() {
    if (!name.trim() || !createdBy) return
    setSaveStatus('saving'); setSaveError(null)
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || !m || !d) { setSaveStatus('error'); setSaveError('생년월일을 입력해주세요'); return }

    const birthHour = hourUnknown ? 11 : (sijin?.hourValue ?? 12)
    const birthMinute = hourUnknown ? 0 : (birthTime ? (parseInt(birthTime.split(':')[1]) || 0) : 0)

    // 일주(dayPillar), 월주(monthPillar) 계산 — 한자
    const saju = sydtoso24yd(y, m, d, birthHour, birthMinute)
    const dayPillarHanja   = ganji[saju.so24day]
    const monthPillarHanja = ganji[saju.so24month]

    // 6개 명식 날짜 계산
    const fakeRecord: ChasamRecord = {
      id: `manual-${Date.now()}`,
      sex: gender,
      name: name.trim(),
      birthYear: y, birthMonth: m, birthDay: d,
      birthdayType: isLunar ? 'L' : 'S',
      birthHour, birthMinute,
      birthDateTime: '', memo, ilju: '', iljuHanja: '',
    }
    const result = convertRecord(fakeRecord, createdBy)

    // additionalDates: 전체 항목에 각각 한자 dayPillar/monthPillar 계산
    const additionalDates = (result.data.additionalDates ?? []).map(ad => {
      const adSaju = sydtoso24yd(ad.year, ad.month, ad.day, birthHour, birthMinute)
      return {
        ...ad,
        dayPillar:   ganji[adSaju.so24day],
        monthPillar: ganji[adSaju.so24month],
      }
    })

    // POST payload: person_basic + person_detail 필드 모두 포함
    const payload = {
      ...result.data,
      createdAt: new Date().toISOString(),
      createdByNickname: createdByNickname,
      birthDate: { ...result.data.birthDate, dayPillar: dayPillarHanja, monthPillar: monthPillarHanja },
      additionalDates,
      occupation: '',
      deathReason: '',
      isPrivate: false,
      // person_detail 필드
      notes: memo.trim(),
      birthPlace: '',
      referenceLinks: [] as string[],
    }

    try {
      const ok = await postPerson(payload)
      if (!ok) { setSaveStatus('error'); setSaveError('서버 저장 실패. 서버 응답을 확인해주세요.'); return }
      setSaveStatus('success')
    } catch (e) {
      setSaveStatus('error')
      setSaveError(e instanceof Error ? e.message : '저장 실패')
    }
  }

  const canCalc = year && month && day

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">수동 입력</h2>

      {/* 사용자 ID */}
      <UserIdInput value={createdBy} onChange={setCreatedBy} onNicknameChange={setCreatedByNickname} />

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

      {/* 저장 결과 */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">saju-cube DB에 저장되었습니다.</div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!name.trim() || saveStatus === 'saving'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {saveStatus === 'saving' ? '저장 중...' : 'DB에 저장'}
        </button>
      </div>
    </div>
  )
}
