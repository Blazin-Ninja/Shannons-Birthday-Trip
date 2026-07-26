import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SPOT_KIND_META } from '../data/spotKinds'
import type { TouristSpot } from '../data/touristSpots'
import { milesFromPoint } from '../lib/cityDiscovery'
import { SpotDetail } from './SpotDetail'

type Props = {
  spots: TouristSpot[]
  activeDayId: string
  stayMode?: boolean
  cityName?: string
  anchor?: { lat: number; lng: number; label: string }
  onPropose: (spot: TouristSpot) => void
  onFocus: (spot: TouristSpot) => void
}

export function NearYou({
  spots,
  activeDayId,
  stayMode = false,
  cityName,
  anchor,
  onPropose,
  onFocus,
}: Props) {
  return (
    <section className="section section--toon" id="near">
      <p className="toon-kicker">
        {stayMode ? 'Things to do nearby' : 'Nearby adventures'}
      </p>
      <h2 className="toon-title">
        {stayMode
          ? `Explore ${cityName === 'Shreveport' ? 'Shreveport' : cityName || 'today'}`
          : 'Near you now'}
      </h2>
      <p className="toon-lead">
        {stayMode
          ? `${spots.length} local picks near the hotel — map them, add to today’s plan, or propose for Shannon.`
          : 'Hand-picked spots on this leg — map them, add to today’s plan, or propose for Shannon’s OK.'}
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
              ⌖
            </span>
            <p>
              {stayMode
                ? 'No local picks in this radius yet — widen the search or open today’s plan.'
                : 'Nothing on this stretch yet — update trip status or open Explore mode for the city you’re in.'}
            </p>
          </motion.div>
        )}
        {spots.map((s, i) => {
          const meta = SPOT_KIND_META[s.kind]
          const distanceLabel =
            stayMode && anchor
              ? `${milesFromPoint(s, anchor)} mi from ${anchor.label}`
              : undefined
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
              <SpotDetail spot={s} compact distanceLabel={distanceLabel} />
              <div className="row">
                <button
                  type="button"
                  className="btn btn-toon-ghost"
                  onClick={() => onFocus(s)}
                >
                  Map it
                </button>
                <Link
                  to={`/drive/${activeDayId}`}
                  state={{ addSpotId: s.id }}
                  className="btn btn-toon-ghost"
                >
                  {stayMode ? 'Add to today' : 'Add to plan'}
                </Link>
                <button
                  type="button"
                  className="btn btn-toon-primary"
                  onClick={() => onPropose(s)}
                >
                  Propose for Shannon
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
