import { TRAVELERS } from '../data/travelers'
import type { LocalIdentity } from './types'

const KEY = 'sbt-identity-v1'

function inferTravelerId(partial: {
  travelerId?: string
  name: string
  avatar?: string
}): string {
  if (partial.travelerId && TRAVELERS.some((t) => t.id === partial.travelerId)) {
    return partial.travelerId
  }

  const byAvatar = TRAVELERS.find((t) => partial.avatar?.includes(t.id))
  if (byAvatar) return byAvatar.id

  const byName = TRAVELERS.find(
    (t) => t.name.toLowerCase() === partial.name.trim().toLowerCase(),
  )
  return byName?.id ?? TRAVELERS[0].id
}

function migrateIdentity(raw: LocalIdentity): LocalIdentity {
  const travelerId = inferTravelerId(raw)
  return {
    ...raw,
    travelerId,
    userId: travelerId,
  }
}

export function loadIdentity(): LocalIdentity | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return migrateIdentity(JSON.parse(raw) as LocalIdentity)
  } catch {
    return null
  }
}

export function saveIdentity(
  partial: Omit<LocalIdentity, 'userId' | 'travelerId'> & {
    userId?: string
    travelerId?: string
  },
): LocalIdentity {
  const travelerId = inferTravelerId(partial)
  const next: LocalIdentity = {
    userId: travelerId,
    travelerId,
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
