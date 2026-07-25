import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SPOT_KIND_META } from '../data/spotKinds'
import type { TouristSpot } from '../data/touristSpots'
import { SpotDetail } from './SpotDetail'

type Props = {
  spots: TouristSpot[]
  distances: Record<string, string>
  usingLiveGps: boolean
  amenityRadiusMiles: number
  savedSpotIds: Set<string>
  savedCount: number
  activeDayId: string
  onPropose: (spot: TouristSpot) => void
  onToggleSaved: (spotId: string) => void
  onFocus: (spot: TouristSpot) => void
}

export function NearYou({
  spots,
  distances,
  usingLiveGps,
  amenityRadiusMiles,
  savedSpotIds,
  savedCount,
  activeDayId,
  onPropose,
  onToggleSaved,
  onFocus,
}: Props) {
  return (
    <section className="section section--toon" id="near">
      <p className="toon-kicker">✨ Nearby adventures ✨</p>
      <h2 className="toon-title">Near you now</h2>
      <p className="toon-lead">
        {usingLiveGps
          ? `Four picks within ${amenityRadiusMiles} mi of your live location — save them, map them, or add to today's drive.`
          : `Within ${amenityRadiusMiles} mi of your position — enable location on the map for live GPS updates.`}
      </p>
      <div className="near-you-actions">
        <Link to="/adventures" className="btn btn-toon-primary">
          Browse & manage ({savedCount} saved)
        </Link>
      </div>
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
              Nothing nearby yet — widen the search radius on the map or open
              Browse & manage to explore more.
            </p>
          </motion.div>
        )}
        {spots.map((s, i) => {
          const meta = SPOT_KIND_META[s.kind]
          const saved = savedSpotIds.has(s.id)
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
              <p className="near-you-distance">{distances[s.id] ?? ''} away</p>
              <SpotDetail spot={s} compact />
              <div className="row">
                <button
                  type="button"
                  className={`btn ${saved ? 'btn-toon-ghost' : 'btn-toon-primary'}`}
                  onClick={() => onToggleSaved(s.id)}
                >
                  {saved ? 'Saved ✓' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-toon-ghost"
                  onClick={() => onFocus(s)}
                >
                  🗺️ Map it
                </button>
                <Link
                  to={`/drive/${activeDayId}`}
                  state={{ addSpotId: s.id }}
                  className="btn btn-toon-ghost"
                >
                  🚗 Add to drive
                </Link>
                <button
                  type="button"
                  className="btn btn-toon-ghost"
                  onClick={() => onPropose(s)}
                >
                  🎂 Propose
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
