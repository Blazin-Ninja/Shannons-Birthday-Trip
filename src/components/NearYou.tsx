import { Link } from 'react-router-dom'
import type { TouristSpot } from '../data/touristSpots'

type Props = {
  spots: TouristSpot[]
  activeDayId: string
  onPropose: (spot: TouristSpot) => void
  onFocus: (spot: TouristSpot) => void
}

export function NearYou({ spots, activeDayId, onPropose, onFocus }: Props) {
  return (
    <section className="section" id="near">
      <p className="section-kicker">Near Shannon&apos;s route</p>
      <h2>Near you now</h2>
      <p className="section-lead">
        Spots for this leg of Shannon&apos;s birthday trip — tap to map, propose
        for Shannon&apos;s OK, or add to today&apos;s drive playbook.
      </p>
      <div className="spot-list">
        {spots.length === 0 && (
          <div className="panel muted">
            Nothing pending on this segment — update trip status or suggest
            something for Shannon&apos;s birthday.
          </div>
        )}
        {spots.map((s) => (
          <div key={s.id} className="spot">
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
              <Link
                to={`/drive/${activeDayId}`}
                state={{ addSpotId: s.id }}
                className="btn btn-ghost"
              >
                Add to drive
              </Link>
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
