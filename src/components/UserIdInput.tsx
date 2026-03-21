import { useState } from 'react'
import { checkSajuCubeUser } from '@/utils/sajuCubeAuth'

interface Props {
  value: string
  onChange: (phone: string) => void
  onNicknameChange?: (nickname: string) => void
}

type Status = 'idle' | 'checking' | 'valid' | 'invalid'

export default function UserIdInput({ value, onChange, onNicknameChange }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')

  async function handleCheck() {
    if (!value.trim()) return
    setStatus('checking')
    const result = await checkSajuCubeUser(value.trim())
    setStatus(result.valid ? 'valid' : 'invalid')
    setMessage(result.message)
    if (result.valid && result.nickname) {
      setNickname(result.nickname)
      onNicknameChange?.(result.nickname)
    } else {
      setNickname('')
      // 서버가 nickname을 반환하지 않으면 사용자가 직접 입력
      onNicknameChange?.('')
    }
  }

  function handleNicknameChange(v: string) {
    setNickname(v)
    onNicknameChange?.(v)
  }

  function handleChange(v: string) {
    onChange(v)
    setStatus('idle')
    setMessage('')
    setNickname('')
    onNicknameChange?.('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        saju-cube 전화번호 (사용자 ID) <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="01012345678"
          maxLength={11}
          className="border rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!value.trim() || status === 'checking'}
          className="px-3 py-1.5 rounded text-sm border border-gray-300 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'checking' ? '확인 중...' : '확인'}
        </button>

        {status === 'valid' && (
          <span className="text-sm text-green-600 font-medium">확인됨</span>
        )}
        {status === 'invalid' && (
          <span className="text-sm text-red-500">{message}</span>
        )}
      </div>
      {status === 'valid' && (
        <div className="flex items-center gap-2 mt-1">
          <label className="text-xs text-gray-500 w-16 shrink-0">닉네임</label>
          <input
            type="text"
            value={nickname}
            readOnly
            placeholder="닉네임 입력 (예: 신성철)"
            className="border rounded px-3 py-1 text-sm w-48 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
          />
        </div>
      )}
      <p className="text-xs text-gray-400">saju-cube에 登錄된 전화번호를 입력하세요. "확인" 버튼으로 존재 여부를 검증할 수 있습니다.</p>
    </div>
  )
}
