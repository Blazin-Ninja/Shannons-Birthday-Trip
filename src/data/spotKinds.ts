import type { SpotKind } from './touristSpots'

export const SPOT_KIND_META: Record<
  SpotKind,
  { emoji: string; label: string; hue: string }
> = {
  landmark: { emoji: '🏰', label: 'Landmark', hue: '#8b5cf6' },
  food: { emoji: '🍔', label: 'Food', hue: '#f97316' },
  nature: { emoji: '🌴', label: 'Nature', hue: '#22c55e' },
  fun: { emoji: '🎢', label: 'Fun', hue: '#ec4899' },
  stop: { emoji: '⭐', label: 'Stop', hue: '#0ea5e9' },
}

export function isSpotKind(kind: string): kind is SpotKind {
  return kind in SPOT_KIND_META
}
