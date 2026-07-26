import type { StopId } from './stops'
import { ITINERARY, type ItineraryDay } from './itinerary'
import { TOURIST_SPOTS, type TouristSpot } from './touristSpots'
import type { TripStatus } from '../lib/types'

export type DriveDayConfig = {
  dayId: string
  segment: string
  startCity: StopId
  endCity: StopId
  defaultDepartAt: string
  isDriveDay: boolean
}

export const DRIVE_DAY_CONFIGS: DriveDayConfig[] = [
  {
    dayId: 'd1',
    segment: 'okc-shreveport',
    startCity: 'Oklahoma City',
    endCity: 'Shreveport',
    defaultDepartAt: '2026-07-27T07:00',
    isDriveDay: true,
  },
  {
    dayId: 'd2',
    segment: 'shreveport',
    startCity: 'Shreveport',
    endCity: 'Shreveport',
    defaultDepartAt: '2026-07-28T09:00',
    isDriveDay: false,
  },
  {
    dayId: 'd3',
    segment: 'shreveport-navarre',
    startCity: 'Shreveport',
    endCity: 'Navarre',
    defaultDepartAt: '2026-07-29T12:00',
    isDriveDay: true,
  },
  {
    dayId: 'd4',
    segment: 'navarre',
    startCity: 'Navarre',
    endCity: 'Navarre',
    defaultDepartAt: '2026-07-30T09:00',
    isDriveDay: false,
  },
  {
    dayId: 'd5',
    segment: 'navarre',
    startCity: 'Navarre',
    endCity: 'Navarre',
    defaultDepartAt: '2026-07-31T09:00',
    isDriveDay: false,
  },
  {
    dayId: 'd6',
    segment: 'navarre-greenville',
    startCity: 'Navarre',
    endCity: 'Greenville',
    defaultDepartAt: '2026-08-01T12:00',
    isDriveDay: true,
  },
  {
    dayId: 'd7',
    segment: 'greenville-okc',
    startCity: 'Greenville',
    endCity: 'Home',
    defaultDepartAt: '2026-08-02T09:00',
    isDriveDay: true,
  },
]

export function getDriveDayConfig(dayId: string): DriveDayConfig | undefined {
  return DRIVE_DAY_CONFIGS.find((d) => d.dayId === dayId)
}

export function getItineraryDay(dayId: string): ItineraryDay | undefined {
  return ITINERARY.find((d) => d.id === dayId)
}

export function spotsForDriveDay(
  dayId: string,
  viaDfw = false,
): TouristSpot[] {
  const config = getDriveDayConfig(dayId)
  if (!config) return []
  return TOURIST_SPOTS.filter((s) => {
    if (s.segment !== config.segment) return false
    if (s.viaDfwOnly && !viaDfw) return false
    return true
  })
}

export function dayIdForStatus(status: TripStatus): string {
  const here = status.whereWeAre
  const headed = status.headedTo

  if (here === 'Shreveport' && headed !== 'Navarre') return 'd2'
  if (here === 'Navarre' && headed !== 'Greenville') return 'd4'
  if (here === 'Greenville') return 'd7'
  if (here === 'Home') return 'd7'

  if (
    headed === 'Shreveport' ||
    (here === 'Oklahoma City' && headed !== 'Home')
  ) {
    return 'd1'
  }
  if (headed === 'Navarre') return 'd3'
  if (headed === 'Greenville') return 'd6'
  if (headed === 'Home') return 'd7'

  return 'd1'
}

export function normalizeDrivePlanDepartAt(
  dayId: string,
  departAt: string,
): string {
  const fallback =
    getDriveDayConfig(dayId)?.defaultDepartAt ?? '2026-07-27T07:00'
  const date = fallback.slice(0, 10)
  const fallbackTime = fallback.slice(11, 16)
  const time = departAt.match(/T([01]\d|2[0-3]):([0-5]\d)/)

  return `${date}T${time ? `${time[1]}:${time[2]}` : fallbackTime}`
}

export function defaultDrivePlan(dayId: string) {
  const config = getDriveDayConfig(dayId)
  return {
    dayId,
    departAt: config?.defaultDepartAt ?? '2026-07-27T07:00',
    stopIds: [] as string[],
    dwellOverrides: {} as Record<string, number>,
    updatedAt: Date.now(),
  }
}
