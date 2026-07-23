import type { SpotKind, TouristSpot } from '../data/touristSpots'
import { estimateRouteDetour } from './routeDeviation'

const KIND_PRIORITY: SpotKind[] = [
  'food',
  'fun',
  'nature',
  'landmark',
  'museum',
  'zoo',
  'waterpark',
  'stop',
]

function sortByProximity(spots: TouristSpot[]): TouristSpot[] {
  return [...spots].sort((a, b) => {
    const da = estimateRouteDetour(a)
    const db = estimateRouteDetour(b)
    if (da.onRoute !== db.onRoute) return da.onRoute ? -1 : 1
    return da.detourMiles - db.detourMiles
  })
}

/** Pick a small curated set with as many different spot kinds as possible. */
export function pickDiverseNearbySpots(
  spots: TouristSpot[],
  limit = 4,
): TouristSpot[] {
  if (spots.length <= limit) return sortByProximity(spots)

  const sorted = sortByProximity(spots)
  const picked: TouristSpot[] = []
  const pickedIds = new Set<string>()

  for (const kind of KIND_PRIORITY) {
    if (picked.length >= limit) break
    const spot = sorted.find((s) => s.kind === kind && !pickedIds.has(s.id))
    if (spot) {
      picked.push(spot)
      pickedIds.add(spot.id)
    }
  }

  for (const spot of sorted) {
    if (picked.length >= limit) break
    if (pickedIds.has(spot.id)) continue
    picked.push(spot)
    pickedIds.add(spot.id)
  }

  return picked
}
