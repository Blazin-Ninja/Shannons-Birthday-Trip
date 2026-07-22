import { motion } from 'framer-motion'
import { SPOT_KIND_META } from '../data/spotKinds'
import type { TouristSpot } from '../data/touristSpots'
import { SpotDetail } from './SpotDetail'

type Props = {
  spots: TouristSpot[]
  onPropose: (spot: TouristSpot) => void
  onFocus: (spot: TouristSpot) => void
}

export function NearYou({ spots, onPropose, onFocus }: Props) {
  return (
    <section className="section section--toon" id="near">
      <p className="toon-kicker">✨ Adventure nearby ✨</p>
      <h2 className="toon-title">Near you now</h2>
      <p className="toon-lead">
        Spots on this leg of Shannon&apos;s birthday quest — map it or pitch it
        for her royal approval!
      </p>
      <div className="spot-list spot-list--toon">
        {spots.length === 0 && (
          <motion.div
            className="toon-card toon-card--empty"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="toon-card-emoji" aria-hidden>
              🗺️
            </span>
            <p>
              Nothing on this stretch yet — update trip status or dream up
              something magical for Shannon&apos;s birthday.
            </p>
          </motion.div>
        )}
        {spots.map((s, i) => {
          const meta = SPOT_KIND_META[s.kind]
          return (
            <motion.article
              key={s.id}
              className="toon-card spot--toon"
              style={{ '--spot-hue': meta.hue } as React.CSSProperties}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 260 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <SpotDetail spot={s} compact />
              <div className="row">
                <button
                  type="button"
                  className="btn btn-toon-ghost"
                  onClick={() => onFocus(s)}
                >
                  🗺️ Map it
                </button>
                <button
                  type="button"
                  className="btn btn-toon-primary"
                  onClick={() => onPropose(s)}
                >
                  🎂 Propose for Shannon
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
