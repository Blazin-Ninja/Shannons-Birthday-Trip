import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TouristSpot } from '../data/touristSpots'
import { firebaseEnabled, firebaseStatusLabel } from '../lib/firebase'
import { googleMapsRouteUrl } from '../lib/routeDeviation'
import type { LiveUser, LocalIdentity, TripPlan, TripStatus } from '../lib/types'
import { AmenityRadiusControl } from './AmenityRadiusControl'
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
  nearbySpots: TouristSpot[]
  mapSpots: TouristSpot[]
  amenityRadiusMiles: number
  onAmenityRadiusChange: (miles: number) => void
  agreedPlans: TripPlan[]
  pendingPlanCount?: number
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
  nearbySpots,
  mapSpots,
  amenityRadiusMiles,
  onAmenityRadiusChange,
  agreedPlans,
  pendingPlanCount = 0,
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
  const dragStartY = useRef<number | null>(null)

  function collapseSheet() {
    setSheetExpanded(false)
  }

  function expandSheet() {
    setSheetExpanded(true)
  }

  function toggleSheet() {
    setSheetExpanded((v) => !v)
  }

  function onHandlePointerDown(clientY: number) {
    dragStartY.current = clientY
  }

  function onHandlePointerUp(clientY: number) {
    const start = dragStartY.current
    dragStartY.current = null
    if (start == null) return

    const delta = clientY - start
    if (delta > 36) {
      collapseSheet()
      return
    }
    if (delta < -36) {
      expandSheet()
      return
    }
    toggleSheet()
  }

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

  const liveCount = Object.entries(users).filter(([id, u]) => {
    if (!u.sharing) return false
    return u.travelerId !== identity.travelerId && id !== identity.travelerId
  }).length

  const myLivePosition = useMemo(() => {
    const live = users[identity.travelerId]
    if (!live?.sharing) return null
    return { lat: live.lat, lng: live.lng }
  }, [users, identity.travelerId])

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
        excludeTravelerId={identity.travelerId}
        myLivePosition={myLivePosition}
        myLiveColor={identity.color}
        myLiveName={identity.name}
        variant="fullscreen"
        autoFit={autoFit}
        onSpotSelect={selectSpot}
        onRecenter={() => {
          setAutoFit(true)
          clearSelection()
        }}
      />

      <div className="map-hub-radius">
        <AmenityRadiusControl
          radiusMiles={amenityRadiusMiles}
          onChange={onAmenityRadiusChange}
        />
      </div>

      <header className="map-hub-header">
        <motion.div
          className="map-hub-title-card"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="map-hub-kicker">Birthday route map</p>
          <h1 className="map-hub-title">Shannon&apos;s Birthday Trip!</h1>
          {!firebaseEnabled() && (
            <p className="map-hub-sync-warn">
              {firebaseStatusLabel()} — family phones won&apos;t share live GPS
              until Firebase is in the app build. Run{' '}
              <code>npm run firebase:guide</code> in the repo.
            </p>
          )}
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
          { id: 'plans', label: 'Plans', badge: pendingPlanCount },
          { id: 'near', label: 'Spots' },
          { id: 'destinations', label: 'Hotels' },
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
            {item.badge ? (
              <span className="map-hub-nav-badge" aria-label={`${item.badge} pending`}>
                {item.badge}
              </span>
            ) : null}
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
        className={`map-hub-sheet ${sheetExpanded ? 'expanded' : 'collapsed'}`}
      >
        <button
          type="button"
          className="map-hub-sheet-handle"
          aria-expanded={sheetExpanded}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            onHandlePointerDown(e.clientY)
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId)
            }
            onHandlePointerUp(e.clientY)
          }}
          onPointerCancel={() => {
            dragStartY.current = null
          }}
        >
          <span className="handle-bar" />
          <span className="handle-label">
            {nearbySpots.length} nearby adventures · within {amenityRadiusMiles} mi of route
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
            {nearbySpots.map((s) => (
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
            {nearbySpots.length === 0 && (
              <p className="muted" style={{ margin: 0 }}>
                No spots within {amenityRadiusMiles} mi of the route on this leg — try widening
                the search radius on the map.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
