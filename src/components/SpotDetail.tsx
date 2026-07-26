import { SPOT_KIND_META } from '../data/spotKinds'
import { isSpotKind } from '../data/spotKinds'
import type { TouristSpot } from '../data/touristSpots'
import { resolveSpotDetails } from '../lib/spotDetails'
import { estimateRouteDetour, formatDetour } from '../lib/routeDeviation'

type Props = {
  spot: TouristSpot
  compact?: boolean
  distanceLabel?: string
}

export function SpotDetail({
  spot,
  compact = false,
  distanceLabel,
}: Props) {
  const meta = isSpotKind(spot.kind)
    ? SPOT_KIND_META[spot.kind]
    : SPOT_KIND_META.landmark
  const { description, mapsUrl, websiteUrl } = resolveSpotDetails(spot)
  const detour = estimateRouteDetour(spot)

  return (
    <div className={`spot-detail${compact ? ' spot-detail--compact' : ''}`}>
      <div className="spot-detail-head">
        <span className="spot-detail-emoji" aria-hidden>
          {meta.emoji}
        </span>
        <div>
          <strong className="spot-detail-name">
            {spot.name}
            {spot.brand ? ` · ${spot.brand}` : ''}
          </strong>
          <span className="spot-detail-tag">{meta.label}</span>
          <span
            className={`spot-detail-detour${
              distanceLabel || detour.onRoute
                ? ' spot-detail-detour--on-route'
                : ''
            }`}
          >
            {distanceLabel ?? formatDetour(detour)}
          </span>
        </div>
      </div>
      <p className="spot-detail-desc">{description}</p>
      <div className="spot-detail-links">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="spot-detail-link"
        >
          Open in Google Maps
        </a>
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="spot-detail-link"
          >
            Website
          </a>
        ) : null}
      </div>
    </div>
  )
}
