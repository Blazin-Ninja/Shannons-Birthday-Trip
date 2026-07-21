import { motion } from 'framer-motion'
import { ITINERARY } from '../data/itinerary'

export function Timeline() {
  return (
    <section className="section trip-section" id="timeline">
      <p className="section-kicker">Birthday route</p>
      <h2>Day by day for Shannon</h2>
      <p className="section-lead">
        The family adventure path — Pensacola is the birthday peak.
      </p>
      <div className="timeline trip-timeline">
        {ITINERARY.map((day, i) => (
          <motion.article
            key={day.id}
            className={`timeline-item trip-day ${day.birthdayPeak ? 'peak' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 320, damping: 22 }}
          >
            <div className="trip-day-top">
              <span className="trip-day-date">{day.dateLabel}</span>
              {day.birthdayPeak && <span className="trip-day-peak">Peak days</span>}
            </div>
            <h3>{day.title}</h3>
            <p>{day.detail}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
