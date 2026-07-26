import type { SpotKind, TouristSpot } from '../data/touristSpots'
import { milesFromPoint } from './cityDiscovery'
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

function sortByRouteProximity(spots: TouristSpot[]): TouristSpot[] {
  return [...spots].sort((a, b) => {
    const da = estimateRouteDetour(a)
    const db = estimateRouteDetour(b)
    if (da.onRoute !== db.onRoute) return da.onRoute ? -1 : 1
    return da.detourMiles - db.detourMiles
  })
}

function sortByPointProximity(
  spots: TouristSpot[],
  point: { lat: number; lng: number },
): TouristSpot[] {
  return [...spots].sort(
    (a, b) => milesFromPoint(a, point) - milesFromPoint(b, point),
  )
}

/** Pick a curated set with as many different spot kinds as possible. */
export function pickDiverseNearbySpots(
  spots: TouristSpot[],
  limit = 4,
  nearPoint?: { lat: number; lng: number },
): TouristSpot[] {
  if (spots.length <= limit) {
    return nearPoint
      ? sortByPointProximity(spots, nearPoint)
      : sortByRouteProximity(spots)
  }

  const sorted = nearPoint
    ? sortByPointProximity(spots, nearPoint)
    : sortByRouteProximity(spots)
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
