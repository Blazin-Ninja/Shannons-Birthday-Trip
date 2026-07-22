import type { TouristSpot } from '../data/touristSpots'

export type ResolvedSpotDetails = {
  description: string
  mapsUrl: string
  websiteUrl?: string
}

export function mapsUrlForSpot(spot: Pick<TouristSpot, 'name' | 'lat' | 'lng'>): string {
  const q = encodeURIComponent(`${spot.name} @ ${spot.lat},${spot.lng}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function resolveSpotDetails(spot: TouristSpot): ResolvedSpotDetails {
  return {
    description: spot.description ?? spot.blurb,
    mapsUrl: spot.mapsUrl ?? mapsUrlForSpot(spot),
    websiteUrl: spot.websiteUrl,
  }
}
