import { motion } from 'framer-motion'
import { ITINERARY } from '../data/itinerary'

export function Timeline() {
  return (
    <section className="section" id="timeline">
      <p className="section-kicker">Birthday route</p>
      <h2>Day by day for Shannon</h2>
      <p className="section-lead">
        The fixed family schedule — Pensacola is the birthday peak.
      </p>
      <div className="timeline">
        {ITINERARY.map((day, i) => (
          <motion.article
            key={day.id}
            className={`timeline-item ${day.birthdayPeak ? 'peak' : ''}`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="muted" style={{ margin: 0 }}>
              {day.dateLabel}
            </p>
            <h3>{day.title}</h3>
            <p style={{ margin: '0.25rem 0 0' }}>{day.detail}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
