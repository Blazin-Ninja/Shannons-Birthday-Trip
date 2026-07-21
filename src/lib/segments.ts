import { getStopCoords, midpoint } from '../data/stops'
import { TOURIST_SPOTS, type TouristSpot } from '../data/touristSpots'
import type { TripStatus } from './types'

export function resolveSegment(status: TripStatus): string {
  const here = status.whereWeAre
  const headed = status.headedTo

  if (here === 'Shreveport') return 'shreveport'
  if (here === 'Pensacola') return 'pensacola'
  if (here === 'Lake Village') return 'lakevillage'
  if (here === 'Home' || (here === 'Oklahoma City' && headed === 'Home')) {
    return 'lakevillage-okc'
  }

  if (here === 'En route' || here === 'Oklahoma City') {
    if (headed === 'Shreveport' || headed === 'Oklahoma City') return 'okc-shreveport'
    if (headed === 'Pensacola') return 'shreveport-pensacola'
    if (headed === 'Lake Village') return 'pensacola-lakevillage'
    if (headed === 'Home') return 'lakevillage-okc'
  }

  if (headed === 'Pensacola') return 'shreveport-pensacola'
  if (headed === 'Lake Village') return 'pensacola-lakevillage'
  if (headed === 'Home') return 'lakevillage-okc'
  if (headed === 'Shreveport') return 'okc-shreveport'

  return 'pensacola'
}

export function youPosition(status: TripStatus): { lat: number; lng: number } {
  if (status.whereWeAre === 'En route') {
    const from =
      getStopCoords(
        status.headedTo === 'Pensacola'
          ? 'Shreveport'
          : status.headedTo === 'Lake Village'
            ? 'Pensacola'
            : status.headedTo === 'Home'
              ? 'Lake Village'
              : 'Oklahoma City',
      ) ?? getStopCoords('Oklahoma City')!
    const to = getStopCoords(status.headedTo) ?? getStopCoords('Pensacola')!
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
