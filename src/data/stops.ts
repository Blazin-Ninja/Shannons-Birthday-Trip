export type StopId =
  | 'Oklahoma City'
  | 'Shreveport'
  | 'Pensacola'
  | 'Lake Village'
  | 'En route'
  | 'Home'

export type Stop = {
  id: StopId
  lat: number
  lng: number
}

export const STOPS: Stop[] = [
  { id: 'Oklahoma City', lat: 35.4676, lng: -97.5164 },
  { id: 'Shreveport', lat: 32.5252, lng: -93.7502 },
  { id: 'Pensacola', lat: 30.4213, lng: -87.2169 },
  { id: 'Lake Village', lat: 33.3301, lng: -91.2818 },
  { id: 'Home', lat: 35.4676, lng: -97.5164 },
]

export const STOP_PRESETS: StopId[] = [
  'Oklahoma City',
  'Shreveport',
  'Pensacola',
  'Lake Village',
  'En route',
  'Home',
]

export const ROUTE_COORDS: [number, number][] = [
  [35.4676, -97.5164], // OKC
  [32.5252, -93.7502], // Shreveport
  [30.4213, -87.2169], // Pensacola
  [33.3301, -91.2818], // Lake Village
  [35.4676, -97.5164], // OKC
]

export function getStopCoords(name: string): { lat: number; lng: number } | null {
  const hit = STOPS.find((s) => s.id === name)
  if (hit) return { lat: hit.lat, lng: hit.lng }
  return null
}

export function midpoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
}
