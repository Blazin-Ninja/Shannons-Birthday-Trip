import { motion } from 'framer-motion'
import { ITINERARY } from '../data/itinerary'

export function Timeline() {
  return (
    <section className="section section--toon" id="timeline">
      <p className="toon-kicker">🎟️ The grand tour 🎟️</p>
      <h2 className="toon-title">Day by day for Shannon</h2>
      <p className="toon-lead">
        Real addresses, real drive days — the Gulf Coast is the birthday peak of
        the whole adventure.
      </p>
      <div className="timeline timeline--toon">
        {ITINERARY.map((day, i) => (
          <motion.article
            key={day.id}
            className={`timeline-item timeline-item--toon ${day.birthdayPeak ? 'peak' : ''}`}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 220 }}
          >
            <span className="timeline-ticket-date">{day.dateLabel}</span>
            <h3>{day.title}</h3>
            <p className="timeline-ticket-detail">{day.detail}</p>
            {day.address && (
              <p className="timeline-ticket-address">{day.address}</p>
            )}
            {day.birthdayPeak && (
              <span className="timeline-peak-badge">Birthday peak ✨</span>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  )
}
