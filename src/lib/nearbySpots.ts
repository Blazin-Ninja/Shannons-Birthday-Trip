import type { SpotKind, TouristSpot } from '../data/touristSpots'
import { haversineMiles, estimateRouteDetour } from './routeDeviation'

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

export function distanceFromPoint(
  spot: Pick<TouristSpot, 'lat' | 'lng'>,
  origin: { lat: number; lng: number },
): number {
  return haversineMiles(origin, { lat: spot.lat, lng: spot.lng })
}

export function formatDistanceMi(miles: number): string {
  if (miles < 0.15) return 'right nearby'
  if (miles < 1) return `~${(Math.round(miles * 10) / 10).toFixed(1)} mi`
  return `~${miles.toFixed(1)} mi`
}

export function filterSpotsNearPoint<T extends Pick<TouristSpot, 'lat' | 'lng'>>(
  spots: T[],
  origin: { lat: number; lng: number },
  radiusMiles: number,
): T[] {
  return spots.filter((s) => distanceFromPoint(s, origin) <= radiusMiles)
}

export function sortSpotsByDistanceFrom<T extends Pick<TouristSpot, 'lat' | 'lng'>>(
  spots: T[],
  origin: { lat: number; lng: number },
): T[] {
  return [...spots].sort(
    (a, b) => distanceFromPoint(a, origin) - distanceFromPoint(b, origin),
  )
}

function sortByProximity(spots: TouristSpot[]): TouristSpot[] {
  return [...spots].sort((a, b) => {
    const da = estimateRouteDetour(a)
    const db = estimateRouteDetour(b)
    if (da.onRoute !== db.onRoute) return da.onRoute ? -1 : 1
    return da.detourMiles - db.detourMiles
  })
}

function pickDiverseFromSorted(
  sorted: TouristSpot[],
  limit = 4,
): TouristSpot[] {
  if (sorted.length <= limit) return sorted

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

/** Pick a small curated set with as many different spot kinds as possible. */
export function pickDiverseNearbySpots(
  spots: TouristSpot[],
  limit = 4,
): TouristSpot[] {
  return pickDiverseFromSorted(sortByProximity(spots), limit)
}

/** Curated nearby picks sorted by distance from a live GPS point. */
export function pickDiverseNearbyFromPoint(
  spots: TouristSpot[],
  origin: { lat: number; lng: number },
  limit = 4,
): TouristSpot[] {
  return pickDiverseFromSorted(sortSpotsByDistanceFrom(spots, origin), limit)
}
