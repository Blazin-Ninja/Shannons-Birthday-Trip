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
    <section className="section" id="pensacola">
      <p className="section-kicker">Birthday peak days</p>
      <h2>Pensacola for Shannon</h2>
      <p className="section-lead">
        Tue–Wed are for celebrating Shannon — propose anything here and await her
        call.
      </p>
      <div className="stack">
        {PICKS.map((p, i) => (
          <motion.div
            key={p.title}
            className="panel"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <h3 style={{ margin: '0 0 0.35rem' }}>{p.title}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {p.detail}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
