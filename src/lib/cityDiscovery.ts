import { TRIP_DESTINATIONS } from '../data/destinations'
import type { TouristSpot } from '../data/touristSpots'
import { haversineMiles } from './routeDeviation'
import { resolveSegment, youPosition } from './segments'
import type { TripStatus } from './types'

const STAY_SEGMENTS = new Set(['shreveport', 'navarre', 'greenville'])

export function isStayStatus(status: TripStatus): boolean {
  return STAY_SEGMENTS.has(resolveSegment(status))
}

export function stayAnchor(
  status: TripStatus,
): { lat: number; lng: number; label: string } {
  const hotel = TRIP_DESTINATIONS.find((d) => d.stopId === status.whereWeAre)
  if (hotel) {
    return { lat: hotel.lat, lng: hotel.lng, label: hotel.name }
  }
  const cityHotel = TRIP_DESTINATIONS.find((d) => {
    const segment = resolveSegment(status)
    return (
      (segment === 'shreveport' && d.stopId === 'Shreveport') ||
      (segment === 'navarre' && d.stopId === 'Navarre') ||
      (segment === 'greenville' && d.stopId === 'Greenville')
    )
  })
  if (cityHotel) {
    return { lat: cityHotel.lat, lng: cityHotel.lng, label: cityHotel.name }
  }
  const you = youPosition(status)
  return {
    lat: you.lat,
    lng: you.lng,
    label: status.whereWeAre,
  }
}

export function milesFromPoint(
  spot: Pick<TouristSpot, 'lat' | 'lng'>,
  point: { lat: number; lng: number },
): number {
  return Math.round(haversineMiles(point, spot) * 10) / 10
}

export function filterSpotsNearPoint<T extends Pick<TouristSpot, 'lat' | 'lng'>>(
  spots: T[],
  point: { lat: number; lng: number },
  radiusMiles: number,
): T[] {
  return spots.filter((spot) => milesFromPoint(spot, point) <= radiusMiles)
}

export function sortSpotsByDistance<T extends Pick<TouristSpot, 'lat' | 'lng'>>(
  spots: T[],
  point: { lat: number; lng: number },
): T[] {
  return [...spots].sort(
    (a, b) => milesFromPoint(a, point) - milesFromPoint(b, point),
  )
}

export function exploreCityFromStatus(status: TripStatus): string | null {
  if (status.whereWeAre === 'Shreveport') return 'Shreveport'
  if (status.whereWeAre === 'Navarre') return 'Navarre'
  if (status.whereWeAre === 'Greenville') return 'Greenville'
  if (status.headedTo === 'Shreveport') return 'Shreveport'
  if (status.headedTo === 'Navarre') return 'Navarre'
  if (status.headedTo === 'Greenville') return 'Greenville'
  return null
}

export function statusForCityExplore(city: string): Partial<TripStatus> {
  return {
    whereWeAre: city,
    headedTo: city,
  }
}
