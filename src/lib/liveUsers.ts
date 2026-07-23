import { TRAVELERS } from '../data/travelers'
import type { LiveUser } from './types'

function inferTravelerId(user: LiveUser, key?: string): string | null {
  if (user.travelerId) return user.travelerId
  if (key && TRAVELERS.some((t) => t.id === key)) return key

  const byAvatar = TRAVELERS.find((t) => user.avatar?.includes(t.id))
  if (byAvatar) return byAvatar.id

  const byName = TRAVELERS.find(
    (t) => t.name.toLowerCase() === user.name.trim().toLowerCase(),
  )
  return byName?.id ?? null
}

export function normalizeLiveUsers(
  users: Record<string, LiveUser>,
): Record<string, LiveUser> {
  const byTraveler = new Map<string, LiveUser>()

  for (const [key, user] of Object.entries(users)) {
    const travelerId = inferTravelerId(user, key)
    if (!travelerId) continue

    const next: LiveUser = { ...user, travelerId }
    const existing = byTraveler.get(travelerId)
    if (!existing || next.updatedAt >= existing.updatedAt) {
      byTraveler.set(travelerId, next)
    }
  }

  return Object.fromEntries(byTraveler)
}
