import type { TouristSpot } from '../data/touristSpots'

type Props = {
  spots: TouristSpot[]
  onPropose: (spot: TouristSpot) => void
  onFocus: (spot: TouristSpot) => void
}

export function NearYou({ spots, onPropose, onFocus }: Props) {
  return (
    <section className="section trip-section" id="near">
      <p className="section-kicker">Near Shannon&apos;s route</p>
      <h2>Near you now</h2>
      <p className="section-lead">
        Spots for this leg — show on the map, or propose for Shannon&apos;s OK.
      </p>
      <div className="spot-list">
        {spots.length === 0 && (
          <div className="panel trip-panel muted">
            Nothing on this segment yet — update trip status or suggest a birthday stop.
          </div>
        )}
        {spots.map((s) => (
          <div key={s.id} className="spot trip-spot">
            <strong>
              {s.name}
              {s.brand ? ` · ${s.brand}` : ''}
            </strong>
            <span className="muted">{s.blurb}</span>
            <div className="row">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onFocus(s)}
              >
                Show on map
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onPropose(s)}
              >
                Propose for Shannon
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
