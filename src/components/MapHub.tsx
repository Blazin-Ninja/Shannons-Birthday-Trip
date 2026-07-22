import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { TouristSpot } from '../data/touristSpots'
import { googleMapsRouteUrl } from '../lib/routeDeviation'
import type { LiveUser, LocalIdentity, TripPlan, TripStatus } from '../lib/types'
import { CartoonFrame } from './CartoonFrame'
import { LiveStatus } from './LiveStatus'
import { SharingToggle } from './SharingToggle'
import { SpotDetail } from './SpotDetail'
import { TripMap } from './TripMap'

type Props = {
  identity: LocalIdentity
  status: TripStatus
  users: Record<string, LiveUser>
  spots: TouristSpot[]
  mapSpots: TouristSpot[]
  agreedPlans: TripPlan[]
  onLocalUpdate: (s: TripStatus) => void
  onPropose: (spot: TouristSpot) => void
  onScrollTo: (id: string) => void
  externalFocus?: { lat: number; lng: number; spotId: string } | null
  onLogout: () => void
}

export function MapHub({
  identity,
  status,
  users,
  spots,
  mapSpots,
  agreedPlans,
  onLocalUpdate,
  onPropose,
  onScrollTo,
  externalFocus,
  onLogout,
}: Props) {
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null)
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [autoFit, setAutoFit] = useState(true)

  useEffect(() => {
    if (!externalFocus) return
    const match = mapSpots.find((s) => s.id === externalFocus.spotId)
    if (match) {
      setSelectedSpot(match)
    }
    setFocus({ lat: externalFocus.lat, lng: externalFocus.lng })
    setAutoFit(false)
    setSheetExpanded(true)
  }, [externalFocus, mapSpots])

  const liveCount = Object.values(users).filter((u) => u.sharing).length

  function selectSpot(spot: TouristSpot) {
    setSelectedSpot(spot)
    setFocus({ lat: spot.lat, lng: spot.lng })
    setAutoFit(false)
    setSheetExpanded(true)
  }

  function clearSelection() {
    setSelectedSpot(null)
    setFocus(null)
  }

  return (
    <motion.div className="map-hub" id="map-hub">
      <TripMap
        status={status}
        users={users}
        spots={spots}
        mapSpots={mapSpots}
        agreedPlans={agreedPlans}
        focus={focus}
        selectedSpotId={selectedSpot?.id ?? null}
        variant="fullscreen"
        autoFit={autoFit}
        onSpotSelect={selectSpot}
        onRecenter={() => {
          setAutoFit(true)
          clearSelection()
        }}
      />

      <header className="map-hub-header">
        <motion.div
          className="map-hub-title-card"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="map-hub-kicker">Birthday route map</p>
          <h1 className="map-hub-title">Shannon&apos;s Birthday Trip!</h1>
          <a
            href={googleMapsRouteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="map-hub-route-link"
          >
            Open full route in Google Maps
          </a>
        </motion.div>
        <div className="map-hub-user-wrap">
          <motion.div
            className="map-hub-user"
            style={{ borderColor: identity.color }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CartoonFrame
              src={identity.avatar ?? '/travelers/shannon.png'}
              alt=""
              native
            />
            <span>{identity.name}</span>
          </motion.div>
          <button type="button" className="map-hub-logout" onClick={onLogout}>
            Switch
          </button>
        </div>
      </header>

      <div className="map-hub-pills">
        <button
          type="button"
          className="map-hub-pill map-hub-pill--status"
          onClick={() => setShowStatus((v) => !v)}
        >
          <span className="pill-dot" />
          {status.whereWeAre} → {status.headedTo}
        </button>
        {liveCount > 0 && (
          <span className="map-hub-pill map-hub-pill--live">
            {liveCount} sharing live
          </span>
        )}
      </div>

      <nav className="map-hub-nav" aria-label="Trip sections">
        {[
          { id: 'plans', label: 'Plans' },
          { id: 'near', label: 'Spots' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'pensacola', label: 'Gulf Coast' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className="map-hub-nav-btn"
            onClick={() => onScrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {showStatus && (
          <motion.div
            className="map-hub-status-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="map-hub-status-inner">
              <div className="map-hub-status-head">
                <h2>Trip status</h2>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowStatus(false)}
                >
                  Close
                </button>
              </div>
              <LiveStatus
                status={status}
                identity={identity}
                onLocalUpdate={onLocalUpdate}
                compact
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="map-hub-sharing">
        <SharingToggle identity={identity} compact />
      </div>

      <motion.div
        className={`map-hub-sheet ${sheetExpanded ? 'expanded' : ''}`}
        layout
      >
        <button
          type="button"
          className="map-hub-sheet-handle"
          aria-expanded={sheetExpanded}
          onClick={() => setSheetExpanded((v) => !v)}
        >
          <span className="handle-bar" />
          <span className="handle-label">
            {spots.length} spots on this leg
            {selectedSpot ? ` · ${selectedSpot.name}` : ''}
          </span>
        </button>

        <div className="map-hub-sheet-body">
          {selectedSpot ? (
            <div className="map-hub-spot-detail">
              <SpotDetail spot={selectedSpot} compact />
              <div className="row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={clearSelection}
                >
                  Clear
                </button>
                {!selectedSpot.id.startsWith('stop-') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onPropose(selectedSpot)}
                  >
                    Propose for Shannon
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="muted map-hub-sheet-hint">
              Tap a marker on the map to see details, or browse spots below.
            </p>
          )}

          <div className="map-hub-spot-scroll">
            {spots.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`map-hub-spot-card ${selectedSpot?.id === s.id ? 'selected' : ''}`}
                onClick={() => selectSpot(s)}
              >
                <strong>{s.name}</strong>
                <span className="muted">{s.blurb}</span>
              </button>
            ))}
            {spots.length === 0 && (
              <p className="muted" style={{ margin: 0 }}>
                No spots on this leg yet — update trip status to refresh.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
