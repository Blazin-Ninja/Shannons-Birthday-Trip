import { Link } from 'react-router-dom'
import { DRIVE_DAY_CONFIGS } from '../data/driveDays'
import { ITINERARY } from '../data/itinerary'
import type { TripStatus } from '../lib/types'

type Props = {
  activeDayId: string
  status: TripStatus
  nearbyCount: number
  pendingCount: number
  onScrollTo: (id: string) => void
}

export function TripOverview({
  activeDayId,
  status,
  nearbyCount,
  pendingCount,
  onScrollTo,
}: Props) {
  const dayIndex = Math.max(
    0,
    ITINERARY.findIndex((day) => day.id === activeDayId),
  )
  const day = ITINERARY[dayIndex]
  const config = DRIVE_DAY_CONFIGS.find((item) => item.dayId === activeDayId)
  const progress = ((dayIndex + 1) / ITINERARY.length) * 100

  return (
    <section className="trip-overview" aria-labelledby="trip-overview-title">
      <div className="trip-overview-head">
        <div>
          <p className="trip-eyebrow">
            Day {dayIndex + 1} of {ITINERARY.length} · {day.dateLabel}
          </p>
          <h2 id="trip-overview-title">{day.title}</h2>
        </div>
        <span className="trip-mode-badge">
          {config?.isDriveDay ? 'Road day' : 'Explore day'}
        </span>
      </div>

      <div className="trip-progress" aria-label={`${Math.round(progress)}% through trip`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="trip-route-now">
        <span>
          <small>Right now</small>
          <strong>{status.whereWeAre}</strong>
        </span>
        <span className="trip-route-arrow" aria-hidden>
          →
        </span>
        <span>
          <small>Next up</small>
          <strong>{status.headedTo}</strong>
        </span>
      </div>

      <div className="trip-overview-actions">
        <Link to={`/drive/${activeDayId}`} className="trip-primary-action">
          <span aria-hidden>☀</span>
          <span>
            <small>Open today</small>
            Plan this day
          </span>
          <span aria-hidden>→</span>
        </Link>
        <Link to="/drive" className="trip-quick-action">
          <span aria-hidden>▦</span>
          <span>
            <strong>All 7 days</strong>
            <small>View itinerary</small>
          </span>
        </Link>
        <button
          type="button"
          className="trip-quick-action"
          onClick={() => onScrollTo('near')}
        >
          <span aria-hidden>⌖</span>
          <span>
            <strong>{nearbyCount} nearby</strong>
            <small>Browse stops</small>
          </span>
        </button>
        <button
          type="button"
          className="trip-quick-action"
          onClick={() => onScrollTo('plans')}
        >
          <span aria-hidden>♡</span>
          <span>
            <strong>{pendingCount || 'No'} pending</strong>
            <small>Family ideas</small>
          </span>
        </button>
      </div>
    </section>
  )
}
