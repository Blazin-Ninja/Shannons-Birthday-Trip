export type TripStatus = {
  whereWeAre: string
  leavingAt: string
  headedTo: string
  updatedAt: number
  updatedBy?: string
  viaDfw?: boolean
}

export type LiveUser = {
  name: string
  color: string
  lat: number
  lng: number
  updatedAt: number
  sharing: boolean
  avatar?: string
}

export type PlanStatus = 'pending' | 'agreed' | 'vetoed'

export type TripPlan = {
  id: string
  title: string
  notes?: string
  placeName?: string
  lat?: number
  lng?: number
  segment?: string
  createdById: string
  createdByName: string
  createdAt: number
  status: PlanStatus
  decidedAt?: number
  decisionNote?: string
}

export type LocalIdentity = {
  userId: string
  name: string
  color: string
  avatar?: string
  isDirector: boolean
}
