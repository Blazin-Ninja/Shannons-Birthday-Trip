import { getStopCoords } from '../data/stops'
import { getDriveDayConfig } from '../data/driveDays'
import { dwellMinutesForSpot, spotById } from '../data/touristSpots'
import type { DriveDayPlan } from './types'

export type ScheduleBlockKind =
  | 'depart'
  | 'drive'
  | 'arrive'
  | 'departStop'
  | 'arriveDest'

export type ScheduleBlock = {
  at: Date
  kind: ScheduleBlockKind
  label: string
  minutes?: number
}

type Point = { lat: number; lng: number; name: string }

const ROAD_FACTOR = 1.3
const AVG_MPH = 55

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function driveMinutesBetween(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const miles = haversineMiles(from.lat, from.lng, to.lat, to.lng) * ROAD_FACTOR
  return Math.max(5, Math.round((miles / AVG_MPH) * 60))
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

function cityPoint(city: string): Point | null {
  const coords = getStopCoords(city)
  if (!coords) return null
  return { ...coords, name: city }
}

export function buildDriveSchedule(plan: DriveDayPlan): ScheduleBlock[] {
  const config = getDriveDayConfig(plan.dayId)
  if (!config) return []

  const start = cityPoint(config.startCity)
  const end = cityPoint(config.endCity)
  if (!start || !end) return []

  const blocks: ScheduleBlock[] = []
  let cursor = new Date(plan.departAt)
  let position: Point = start

  blocks.push({
    at: new Date(cursor),
    kind: 'depart',
    label: `Leave ${start.name}`,
  })

  const stops = plan.stopIds
    .map((id) => spotById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  for (const stop of stops) {
    const driveMin = driveMinutesBetween(position, stop)
    cursor = addMinutes(cursor, driveMin)
    blocks.push({
      at: new Date(cursor),
      kind: 'drive',
      label: `Drive to ${stop.name}`,
      minutes: driveMin,
    })

    blocks.push({
      at: new Date(cursor),
      kind: 'arrive',
      label: `Arrive ${stop.name}`,
    })

    const dwell =
      plan.dwellOverrides?.[stop.id] ?? dwellMinutesForSpot(stop)
    cursor = addMinutes(cursor, dwell)
    blocks.push({
      at: new Date(cursor),
      kind: 'departStop',
      label: `Leave ${stop.name}`,
      minutes: dwell,
    })

    position = { lat: stop.lat, lng: stop.lng, name: stop.name }
  }

  const finalDrive = driveMinutesBetween(position, end)
  cursor = addMinutes(cursor, finalDrive)
  blocks.push({
    at: new Date(cursor),
    kind: 'drive',
    label: config.isDriveDay
      ? `Drive to ${end.name}`
      : `Return toward ${end.name}`,
    minutes: finalDrive,
  })

  blocks.push({
    at: new Date(cursor),
    kind: 'arriveDest',
    label: `Arrive ${end.name}`,
  })

  return blocks
}

export function formatScheduleTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function totalDriveMinutes(blocks: ScheduleBlock[]): number {
  return blocks
    .filter((b) => b.kind === 'drive')
    .reduce((sum, b) => sum + (b.minutes ?? 0), 0)
}
