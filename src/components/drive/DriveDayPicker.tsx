import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DRIVE_DAY_CONFIGS } from '../../data/driveDays'
import { ITINERARY } from '../../data/itinerary'

export function DriveDayPicker() {
  return (
    <div className="drive-page">
      <header className="drive-header">
        <Link to="/" className="drive-back">
          ← Back to trip
        </Link>
        <p className="section-kicker">Drive playbook</p>
        <h1 className="drive-title">Plan one day at a time</h1>
        <p className="section-lead">
          Pick a day, choose attractions, and review Shannon&apos;s hour-by-hour
          play-by-play before you roll.
        </p>
      </header>

      <div className="drive-day-list">
        {ITINERARY.map((day, i) => {
          const config = DRIVE_DAY_CONFIGS.find((d) => d.dayId === day.id)
          return (
            <motion.article
              key={day.id}
              className={`drive-day-card ${day.birthdayPeak ? 'peak' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="drive-day-card-body">
                <p className="muted" style={{ margin: 0 }}>
                  {day.dateLabel}
                </p>
                <h2>{day.title}</h2>
                <p className="drive-day-detail">{day.detail}</p>
                {config && (
                  <p className="drive-day-meta muted">
                    {config.isDriveDay
                      ? `${config.startCity} → ${config.endCity}`
                      : `Explore ${config.startCity}`}
                  </p>
                )}
              </div>
              <Link
                to={`/drive/${day.id}`}
                className="btn btn-primary drive-day-cta"
              >
                Plan & review
              </Link>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
