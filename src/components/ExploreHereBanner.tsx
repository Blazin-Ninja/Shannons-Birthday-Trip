import { saveStatus } from '../lib/firebase'
import {
  exploreCityFromStatus,
  isStayStatus,
  statusForCityExplore,
} from '../lib/cityDiscovery'
import type { LocalIdentity, TripStatus } from '../lib/types'

type Props = {
  identity: LocalIdentity
  status: TripStatus
  onLocalUpdate: (status: TripStatus) => void
}

export function ExploreHereBanner({
  identity,
  status,
  onLocalUpdate,
}: Props) {
  const city = exploreCityFromStatus(status)
  if (!city) return null

  const alreadyExploring =
    isStayStatus(status) &&
    status.whereWeAre === city &&
    status.headedTo === city

  if (alreadyExploring) return null

  async function switchToExplore() {
    const next: TripStatus = {
      ...status,
      ...statusForCityExplore(city!),
      updatedBy: identity.name,
      updatedAt: Date.now(),
    }
    onLocalUpdate(next)
    await saveStatus(next)
  }

  return (
    <div className="explore-here-banner">
      <div>
        <p className="explore-here-eyebrow">Local discovery</p>
        <strong>In {city}? Switch to explore mode.</strong>
        <p>
          Right now the map is still showing road-trip corridor stops. Tap below
          to unlock {city} food, museums, parks, and walks near the hotel.
        </p>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => void switchToExplore()}>
        Explore {city} now
      </button>
    </div>
  )
}
