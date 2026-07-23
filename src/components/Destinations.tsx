import { motion } from 'framer-motion'
import { TRIP_DESTINATIONS } from '../data/destinations'
import { TOURIST_SPOTS } from '../data/touristSpots'
import type { TouristSpot } from '../data/touristSpots'
import { mapsUrlForSpot } from '../lib/spotDetails'

type Props = {
  onFocusSpot?: (spot: TouristSpot) => void
}

function spotById(id: string): TouristSpot | undefined {
  return TOURIST_SPOTS.find((s) => s.id === id)
}

export function Destinations({ onFocusSpot }: Props) {
  return (
    <section className="section section--toon" id="destinations">
      <p className="toon-kicker">🏨 Your home bases 🏨</p>
      <h2 className="toon-title">Trip destinations</h2>
      <p className="toon-lead">
        Real hotels at the addresses on your itinerary — amenities, photos, and
        popular spots within easy reach of each stay.
      </p>

      <div className="dest-grid">
        {TRIP_DESTINATIONS.map((dest, i) => (
          <motion.article
            key={dest.id}
            className="dest-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 220 }}
          >
            <div className="dest-card-media">
              <img src={dest.imageUrl} alt={dest.name} loading="lazy" />
              <span className="dest-card-nights">{dest.nightsLabel}</span>
            </div>

            <div className="dest-card-body">
              <div className="dest-card-head">
                <h3>
                  {dest.name}
                  {dest.brand ? (
                    <span className="dest-card-brand"> · {dest.brand}</span>
                  ) : null}
                </h3>
                <p className="dest-card-tagline">{dest.tagline}</p>
              </div>

              <p className="dest-card-desc">{dest.description}</p>

              <div className="dest-card-meta">
                <p className="dest-card-address">📍 {dest.address}</p>
                <p className="dest-card-phone">
                  <a href={`tel:${dest.phone.replace(/\D/g, '')}`}>{dest.phone}</a>
                </p>
                {(dest.checkIn || dest.checkOut) && (
                  <p className="dest-card-times">
                    {dest.checkIn ? `Check-in ${dest.checkIn}` : ''}
                    {dest.checkIn && dest.checkOut ? ' · ' : ''}
                    {dest.checkOut ? `Check-out ${dest.checkOut}` : ''}
                  </p>
                )}
              </div>

              <div className="dest-amenities">
                <h4>Amenities</h4>
                <ul className="dest-amenity-list">
                  {dest.amenities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="dest-nearby">
                <h4>Popular nearby</h4>
                <div className="dest-nearby-chips">
                  {dest.nearbySpotIds.map((spotId) => {
                    const spot = spotById(spotId)
                    if (!spot) return null
                    return (
                      <button
                        key={spotId}
                        type="button"
                        className="dest-nearby-chip"
                        onClick={() => onFocusSpot?.(spot)}
                      >
                        {spot.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="dest-card-links">
                <a
                  href={mapsUrlForSpot({
                    name: dest.name,
                    lat: dest.lat,
                    lng: dest.lng,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spot-detail-link"
                >
                  📍 Directions
                </a>
                <a
                  href={dest.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spot-detail-link"
                >
                  🌐 Hotel website
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
