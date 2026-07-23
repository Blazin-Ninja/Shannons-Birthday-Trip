import { ROUTE_COORDS, SEGMENT_ROUTE_COORDS } from './routes'

export type StopId =
  | 'Oklahoma City'
  | 'Shreveport'
  | 'Navarre'
  | 'Greenville'
  | 'En route'
  | 'Home'

export type Stop = {
  id: StopId
  lat: number
  lng: number
  address: string
}

export const STOPS: Stop[] = [
  {
    id: 'Oklahoma City',
    lat: 35.4945,
    lng: -97.6259,
    address: '6400 NW 24th St, Oklahoma City, OK 73127',
  },
  {
    id: 'Shreveport',
    lat: 32.5155,
    lng: -93.7495,
    address: '104 Market St, Shreveport, LA 71101',
  },
  {
    id: 'Navarre',
    lat: 30.4024,
    lng: -86.9006,
    address: '7710 Navarre Pkwy, Navarre, FL 32566',
  },
  {
    id: 'Greenville',
    lat: 33.4114,
    lng: -91.0654,
    address: '211 S Walnut St, Greenville, MS 38701',
  },
  {
    id: 'Home',
    lat: 35.4945,
    lng: -97.6259,
    address: '6400 NW 24th St, Oklahoma City, OK 73127',
  },
]

export const STOP_PRESETS: StopId[] = [
  'Oklahoma City',
  'Shreveport',
  'Navarre',
  'Greenville',
  'En route',
  'Home',
]

export { ROUTE_COORDS, SEGMENT_ROUTE_COORDS }

export function getStopCoords(name: string): { lat: number; lng: number } | null {
  const hit = STOPS.find((s) => s.id === name)
  if (hit) return { lat: hit.lat, lng: hit.lng }
  return null
}

export function getStopAddress(name: string): string | null {
  const hit = STOPS.find((s) => s.id === name)
  return hit?.address ?? null
}

export function midpoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
}
