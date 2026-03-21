import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { parseChasamJson, convertBatch, type BatchConversionResult, type ChasamRecord } from '@/utils/chasamConverter'
import UserIdInput from '@/components/UserIdInput'

export default function ImportPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [createdBy, setCreatedBy] = useState('')
  const [batchResult, setBatchResult] = useState<BatchConversionResult | null>(null)
  const [rawRecords, setRawRecords] = useState<ChasamRecord[]>([])

  const processFile = useCallback(async (file: File) => {
    setParseError(null)
    setBatchResult(null)
    setIsLoading(true)
    try {
      const text = await file.text()
      const records = parseChasamJson(text)
      if (records.length === 0) { setParseError('변환할 데이터가 없습니다'); return }
      setRawRecords(records)
      setBatchResult(convertBatch(records, createdBy))
    } catch (e) {
      setParseError(e instanceof Error ? e.message : '파일 처리 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [createdBy])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">JSON 파일 임포트</h2>
        <p className="text-sm text-gray-500 mt-1">차샘 만세력에서 내보낸 JSON 파일을 업로드하세요.</p>
      </div>

      {/* 사용자 ID */}
      <UserIdInput value={createdBy} onChange={setCreatedBy} />

      {/* 드래그앤드롭 */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".json,.txt" className="hidden" onChange={handleFileChange} />
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-600 font-medium">JSON 파일을 드래그하거나 클릭해서 선택</p>
        <p className="text-xs text-gray-400 mt-1">차샘 만세력 DB 내보내기 파일 (.json)</p>
      </div>

      {parseError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{parseError}</div>}
      {isLoading && <div className="text-center text-gray-500 py-4">변환 중...</div>}

      {batchResult && (
        <>
          {/* 요약 */}
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-gray-600">총 <strong>{batchResult.totalCount}</strong>건</span>
            <span className="text-green-600">✅ OK: {batchResult.okCount}</span>
            <span className="text-yellow-600">⚠️ 경고: {batchResult.warningCount}</span>
            <span className="text-red-600">❌ 오류: {batchResult.errorCount}</span>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#','이름','생년월일','음양력','일주(원본)','일주(계산)','상태'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batchResult.results.map((r, i) => {
                  const orig = rawRecords[i]
                  const bg = r.status === 'error' ? 'bg-red-50' : r.status === 'warning' ? 'bg-yellow-50' : ''
                  return (
                    <tr key={r.data.id} className={`border-b last:border-0 ${bg}`}>
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{r.data.name}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {orig.birthYear}.{String(orig.birthMonth).padStart(2,'0')}.{String(orig.birthDay).padStart(2,'0')}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          orig.birthdayType === 'L' ? 'bg-blue-100 text-blue-700' :
                          orig.birthdayType === 'N' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {orig.birthdayType === 'L' ? '음력' : orig.birthdayType === 'N' ? '미상' : '양력'}
                        </span>
                      </td>
                      <td className="px-3 py-2">{r.originalIlju}</td>
                      <td className={`px-3 py-2 ${!r.iljuValid ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{r.calculatedIlju}</td>
                      <td className="px-3 py-2 text-base">{r.status === 'ok' ? '✅' : r.status === 'warning' ? '⚠️' : '❌'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1">
            {!createdBy.trim() && <p className="text-xs text-red-500">사용자 ID를 입력해야 다음 단계로 진행할 수 있습니다</p>}
            <button
              onClick={() => navigate('/review', { state: { batchResult, rawRecords, createdBy } })}
              disabled={!createdBy.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              다음 단계: 검토하기 →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
