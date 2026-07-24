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
    defaultDepartAt: '2026-07-27T09:00',
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
    segment: 'shreveport-pensacola',
    startCity: 'Shreveport',
    endCity: 'Pensacola',
    defaultDepartAt: '2026-07-29T10:00',
    isDriveDay: true,
  },
  {
    dayId: 'd4',
    segment: 'pensacola',
    startCity: 'Pensacola',
    endCity: 'Pensacola',
    defaultDepartAt: '2026-07-30T09:00',
    isDriveDay: false,
  },
  {
    dayId: 'd5',
    segment: 'pensacola-lakevillage',
    startCity: 'Pensacola',
    endCity: 'Lake Village',
    defaultDepartAt: '2026-08-01T10:00',
    isDriveDay: true,
  },
  {
    dayId: 'd6',
    segment: 'lakevillage-okc',
    startCity: 'Lake Village',
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

  if (here === 'Shreveport' && headed !== 'Pensacola') return 'd2'
  if (here === 'Pensacola' && headed !== 'Lake Village') return 'd4'
  if (here === 'Lake Village') return 'd6'
  if (here === 'Home') return 'd6'

  if (headed === 'Shreveport' || (here === 'Oklahoma City' && headed !== 'Home')) {
    return 'd1'
  }
  if (headed === 'Pensacola') return 'd3'
  if (headed === 'Lake Village') return 'd5'
  if (headed === 'Home') return 'd6'

  return 'd1'
}

export function defaultDrivePlan(dayId: string) {
  const config = getDriveDayConfig(dayId)
  return {
    dayId,
    departAt: config?.defaultDepartAt ?? '2026-07-27T09:00',
    stopIds: [] as string[],
    dwellOverrides: {} as Record<string, number>,
    updatedAt: Date.now(),
  }
}
