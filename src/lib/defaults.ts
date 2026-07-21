import type { TripStatus } from './types'

export const defaultStatus: TripStatus = {
  whereWeAre: 'Oklahoma City',
  leavingAt: '2026-07-27T09:00',
  headedTo: 'Shreveport',
  updatedAt: Date.now(),
  viaDfw: false,
}
