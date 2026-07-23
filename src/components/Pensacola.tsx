import { motion } from 'framer-motion'

const PICKS = [
  {
    emoji: '🌅',
    title: 'Navarre Beach Pier',
    detail: 'Steps from 7710 Navarre Pkwy — sunset walks and fishing pier views.',
    hue: '#38bdf8',
  },
  {
    emoji: '🏖️',
    title: 'Pensacola Beach',
    detail: 'Sugar sand and emerald water — Shannon’s birthday shoreline.',
    hue: '#f472b6',
  },
  {
    emoji: '🏰',
    title: 'Fort Pickens',
    detail: 'History plus Gulf Islands trails when the crew wants to wander.',
    hue: '#a78bfa',
  },
  {
    emoji: '✈️',
    title: 'Naval Aviation Museum',
    detail: 'AC and jets when the Gulf afternoon heat calls for an indoor win.',
    hue: '#fb923c',
  },
  {
    emoji: '🎨',
    title: 'Seaside & 30-A',
    detail: 'Day-trip the pastel coastal towns east along the Emerald Coast.',
    hue: '#4ade80',
  },
]

export function Pensacola() {
  return (
    <section className="section section--toon" id="pensacola">
      <p className="toon-kicker">🌊 Birthday peak days 🌊</p>
      <h2 className="toon-title">Navarre &amp; the Gulf for Shannon</h2>
      <p className="toon-lead">
        Tue–Wed at Hampton Inn & Suites Navarre — propose anything here and await the
        birthday director&apos;s call.
      </p>
      <div className="toon-pick-grid">
        {PICKS.map((p, i) => (
          <motion.article
            key={p.title}
            className="toon-card toon-pick-card"
            style={{ '--pick-hue': p.hue } as React.CSSProperties}
            initial={{ opacity: 0, y: 18, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 240 }}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <span className="toon-pick-emoji" aria-hidden>
              {p.emoji}
            </span>
            <h3>{p.title}</h3>
            <p>{p.detail}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
