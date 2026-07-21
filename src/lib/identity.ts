import type { LocalIdentity } from './types'

const KEY = 'sbt-identity-v1'

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `u-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function loadIdentity(): LocalIdentity | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as LocalIdentity
  } catch {
    return null
  }
}

export function saveIdentity( partial: Omit<LocalIdentity, 'userId'> & { userId?: string },
): LocalIdentity {
  const existing = loadIdentity()
  const next: LocalIdentity = {
    userId: partial.userId ?? existing?.userId ?? uuid(),
    name: partial.name,
    color: partial.color,
    avatar: partial.avatar,
    isDirector: partial.isDirector,
  }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearIdentity() {
  localStorage.removeItem(KEY)
}
