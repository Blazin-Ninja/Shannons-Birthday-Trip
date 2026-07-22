import { getStopCoords, midpoint } from '../data/stops'
import { SEGMENT_ROUTE_COORDS, type RouteSegmentId } from '../data/routes'
import { TOURIST_SPOTS, type TouristSpot } from '../data/touristSpots'
import type { TripStatus } from './types'

export const SEGMENT_COORDS = SEGMENT_ROUTE_COORDS

export function resolveSegment(status: TripStatus): RouteSegmentId {
  const here = status.whereWeAre
  const headed = status.headedTo

  if (here === 'Shreveport') return 'shreveport'
  if (here === 'Navarre') return 'navarre'
  if (here === 'Greenville') return 'greenville'
  if (here === 'Home' || (here === 'Oklahoma City' && headed === 'Home')) {
    return 'greenville-okc'
  }

  if (here === 'En route' || here === 'Oklahoma City') {
    if (headed === 'Shreveport' || headed === 'Oklahoma City') return 'okc-shreveport'
    if (headed === 'Navarre') return 'shreveport-navarre'
    if (headed === 'Greenville') return 'navarre-greenville'
    if (headed === 'Home') return 'greenville-okc'
  }

  if (headed === 'Navarre') return 'shreveport-navarre'
  if (headed === 'Greenville') return 'navarre-greenville'
  if (headed === 'Home') return 'greenville-okc'
  if (headed === 'Shreveport') return 'okc-shreveport'

  return 'navarre'
}

export function youPosition(status: TripStatus): { lat: number; lng: number } {
  if (status.whereWeAre === 'En route') {
    const from =
      getStopCoords(
        status.headedTo === 'Navarre'
          ? 'Shreveport'
          : status.headedTo === 'Greenville'
            ? 'Navarre'
            : status.headedTo === 'Home'
              ? 'Greenville'
              : 'Oklahoma City',
      ) ?? getStopCoords('Oklahoma City')!
    const to = getStopCoords(status.headedTo) ?? getStopCoords('Navarre')!
    return midpoint(from, to)
  }
  return getStopCoords(status.whereWeAre) ?? getStopCoords('Oklahoma City')!
}

export function destinationPosition(status: TripStatus): {
  lat: number
  lng: number
} | null {
  return getStopCoords(status.headedTo)
}

export function spotsForStatus(status: TripStatus): TouristSpot[] {
  const segment = resolveSegment(status)
  return TOURIST_SPOTS.filter((s) => {
    if (s.segment !== segment) return false
    if (s.viaDfwOnly && !status.viaDfw) return false
    return true
  })
}
