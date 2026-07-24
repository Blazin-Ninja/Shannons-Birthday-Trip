const KEY = 'sbt-amenity-radius-mi'

export const AMENITY_RADIUS_PRESETS = [5, 10, 20, 35, 50] as const
export const DEFAULT_AMENITY_RADIUS_MI = 20

export function loadAmenityRadiusMi(): number {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_AMENITY_RADIUS_MI
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 1 || n > 100) return DEFAULT_AMENITY_RADIUS_MI
    return n
  } catch {
    return DEFAULT_AMENITY_RADIUS_MI
  }
}

export function saveAmenityRadiusMi(miles: number) {
  localStorage.setItem(KEY, String(miles))
}
