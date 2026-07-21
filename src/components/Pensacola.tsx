import { motion } from 'framer-motion'

const PICKS = [
  {
    title: 'Pensacola Beach',
    detail: 'Sugar sand and emerald water — Shannon’s birthday shoreline.',
  },
  {
    title: 'Fort Pickens',
    detail: 'History + Gulf Islands trails when the crew wants to wander.',
  },
  {
    title: 'Beach Boardwalk',
    detail: 'Dinner lights and a celebratory stroll for the birthday lead.',
  },
  {
    title: 'Naval Aviation Museum',
    detail: 'AC + jets when afternoon heat calls for an indoor win.',
  },
]

export function Pensacola() {
  return (
    <section className="section trip-section trip-peak-section" id="pensacola">
      <p className="section-kicker">Birthday peak days</p>
      <h2>Pensacola for Shannon</h2>
      <p className="section-lead">
        Tue–Wed are for celebrating Shannon — propose anything and await her call.
      </p>
      <div className="stack trip-peak-grid">
        {PICKS.map((p, i) => (
          <motion.div
            key={p.title}
            className="panel trip-panel trip-peak-card"
            initial={{ opacity: 0, y: 16, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 20 }}
          >
            <h3>{p.title}</h3>
            <p className="muted">{p.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
