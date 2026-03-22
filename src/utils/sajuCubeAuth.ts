/**
 * saju-cube API 연동 유틸리티
 */

const PROJECT_ID = 'jjlxvljddlqdgqfwoaew'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbHh2bGpkZGxxZGdxZndvYWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDQyNDUsImV4cCI6MjA4NTk4MDI0NX0.9UyDHQx_4uo77ZA3zl2BCtIxnWoNWtbNXi2Y8tOFayU'
export const API_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-a1841ea8`
const AUTH_HEADERS = { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` }

export interface UserCheckResult {
  valid: boolean
  exists: boolean
  isPending?: boolean
  isActive?: boolean
  nickname?: string
  message: string
}

/**
 * 전화번호(userId)가 saju-cube에 존재하는 유효한 사용자인지 확인.
 * check-id로 유효성 검증 후, /profile 엔드포인트로 nickname을 가져옴
 */
export async function checkSajuCubeUser(phone: string): Promise<UserCheckResult> {
  try {
    // 1) check-id API로 유효성 검증
    const res = await fetch(
      `${API_BASE}/users/check-id?userId=${encodeURIComponent(phone)}`,
      { headers: { Authorization: `Bearer ${ANON_KEY}` } },
    )
    if (!res.ok) return { valid: false, exists: false, message: `서버 오류 (${res.status})` }
    const json = await res.json()

    if (json.success !== true) {
      return {
        valid: false,
        exists: json.exists ?? false,
        isPending: json.isPending,
        isActive: json.isActive,
        message: json.message ?? '',
      }
    }

    // 2) 유효한 사용자면 /profile로 nickname 조회
    let nickname = ''
    try {
      const profileRes = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${ANON_KEY}`, 'X-User-Id': phone },
      })
      if (profileRes.ok) {
        const profileJson = await profileRes.json()
        nickname = profileJson.data?.nickname ?? ''
      }
    } catch { /* nickname 없이 진행 */ }

    return {
      valid: true,
      exists: true,
      isPending: false,
      isActive: true,
      nickname,
      message: json.message ?? '',
    }
  } catch {
    return { valid: false, exists: false, message: '네트워크 오류가 발생했습니다' }
  }
}

/**
 * 특정 사용자가 생성한 persons 목록 조회
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchPersonsByUser(phone: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/persons`, {
      headers: { ...AUTH_HEADERS, 'X-User-Id': phone },
    })
    if (!res.ok) return []
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).filter((p: any) => p.createdBy === phone)
  } catch {
    return []
  }
}

export async function fetchPersonById(id: string, phone: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_BASE}/persons/${encodeURIComponent(id)}`, {
      headers: { ...AUTH_HEADERS, 'X-User-Id': phone },
    })
    if (!res.ok) return null
    const json = await res.json()
    return (json.data ?? json.person ?? null) as Record<string, unknown> | null
  } catch {
    return null
  }
}

/**
 * MinimalPersonData 1건을 saju-cube Edge Function으로 저장
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function postPerson(person: Record<string, any>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/persons`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(person),
    })
    if (!res.ok) return false
    const json = await res.json()
    return json.success === true
  } catch {
    return false
  }
}
