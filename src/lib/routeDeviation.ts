import { ROUTE_COORDS } from '../data/routes'
import type { TouristSpot } from '../data/touristSpots'

export type RouteDetour = {
  offRouteMiles: number
  detourMiles: number
  detourMinutes: number
  onRoute: boolean
}

type Point = { lat: number; lng: number }

const EARTH_RADIUS_MI = 3958.8
const ON_ROUTE_THRESHOLD_MI = 0.35

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function haversineMiles(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h))
}

function projectOnSegment(
  p: Point,
  a: [number, number],
  b: [number, number],
): Point {
  const ax = a[1]
  const ay = a[0]
  const bx = b[1]
  const by = b[0]
  const px = p.lng
  const py = p.lat

  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return { lat: ay, lng: ax }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return { lat: ay + t * dy, lng: ax + t * dx }
}

export function nearestOnRoute(
  point: Point,
  route: [number, number][] = ROUTE_COORDS,
): { point: Point; distanceMiles: number } {
  let bestPoint = { lat: route[0][0], lng: route[0][1] }
  let bestDistance = Infinity

  for (let i = 0; i < route.length - 1; i++) {
    const projected = projectOnSegment(point, route[i], route[i + 1])
    const distance = haversineMiles(point, projected)
    if (distance < bestDistance) {
      bestDistance = distance
      bestPoint = projected
    }
  }

  return { point: bestPoint, distanceMiles: bestDistance }
}

export function estimateRouteDetour(
  spot: Pick<TouristSpot, 'lat' | 'lng'>,
  route: [number, number][] = ROUTE_COORDS,
): RouteDetour {
  const { distanceMiles } = nearestOnRoute({ lat: spot.lat, lng: spot.lng }, route)
  const offRouteMiles = Math.round(distanceMiles * 10) / 10
  const onRoute = offRouteMiles <= ON_ROUTE_THRESHOLD_MI

  if (onRoute) {
    return { offRouteMiles, detourMiles: 0, detourMinutes: 0, onRoute: true }
  }

  // Round-trip to rejoin the highway at the nearest point.
  const detourMiles = Math.round(offRouteMiles * 2 * 10) / 10
  const detourMinutes = Math.max(
    5,
    Math.round((detourMiles / 45) * 60 + offRouteMiles * 1.5),
  )

  return { offRouteMiles, detourMiles, detourMinutes, onRoute: false }
}

export function isWithinRouteRadius(
  spot: Pick<TouristSpot, 'lat' | 'lng'>,
  radiusMiles: number,
  route: [number, number][] = ROUTE_COORDS,
): boolean {
  const { distanceMiles } = nearestOnRoute({ lat: spot.lat, lng: spot.lng }, route)
  return distanceMiles <= radiusMiles
}

export function filterSpotsWithinRadius<T extends Pick<TouristSpot, 'lat' | 'lng'>>(
  spots: T[],
  radiusMiles: number,
  route: [number, number][] = ROUTE_COORDS,
): T[] {
  return spots.filter((s) => isWithinRouteRadius(s, radiusMiles, route))
}

export function filterSpotsForAmenityRadius<
  T extends Pick<TouristSpot, 'lat' | 'lng'> & { alwaysOnMap?: boolean },
>(spots: T[], radiusMiles: number, route: [number, number][] = ROUTE_COORDS): T[] {
  return spots.filter(
    (s) => s.alwaysOnMap || isWithinRouteRadius(s, radiusMiles, route),
  )
}

export function formatDetour(detour: RouteDetour): string {
  if (detour.onRoute) return 'On the main route'
  return `~${detour.detourMiles} mi / ~${detour.detourMinutes} min off-route`
}

export function googleMapsRouteUrl(): string {
  const stops = [
    '6400 NW 24th St, Oklahoma City, OK 73127',
    '104 Market St, Shreveport, LA 71101',
    '7710 Navarre Pkwy, Navarre, FL 32566',
    '211 S Walnut St, Greenville, MS 38701',
    '6400 NW 24th St, Oklahoma City, OK 73127',
  ]
  const origin = encodeURIComponent(stops[0])
  const destination = encodeURIComponent(stops[stops.length - 1]!)
  const waypoints = stops.slice(1, -1).map(encodeURIComponent).join('|')
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin}&destination=${destination}&waypoints=${waypoints}` +
    `&travelmode=driving`
  )
}
