import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { ROUTE_COORDS, STOPS } from '../data/stops'
import type { TouristSpot } from '../data/touristSpots'
import { isSpotKind, SPOT_KIND_META } from '../data/spotKinds'
import {
  destinationPosition,
  resolveSegment,
  SEGMENT_COORDS,
  youPosition,
} from '../lib/segments'
import type { LiveUser, TripPlan, TripStatus } from '../lib/types'
import { SpotDetail } from './SpotDetail'

const youIcon = (color: string, size = 18) =>
  L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:18px solid #e07a5f;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))"></div>`,
  iconSize: [20, 18],
  iconAnchor: [10, 18],
})

const spotIcon = (kind: string, selected = false, dimmed = false) => {
  const meta = isSpotKind(kind) ? SPOT_KIND_META[kind] : SPOT_KIND_META.landmark
  const size = selected ? 38 : dimmed ? 28 : 32
  const fontSize = selected ? 18 : dimmed ? 13 : 15
  const dimClass = dimmed ? ' spot-marker-pin--dim' : ''
  return L.divIcon({
    className: 'spot-marker-icon',
    html: `<div class="spot-marker-pin${selected ? ' spot-marker-pin--selected' : ''}${dimClass}" style="width:${size}px;height:${size}px;background:linear-gradient(145deg,${meta.hue},${meta.hue}cc);border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;line-height:1;box-shadow:0 4px 14px rgba(0,0,0,.28)">${meta.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const stopIcon = (name: string, active: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="width:${active ? 14 : 11}px;height:${active ? 14 : 11}px;border-radius:50%;background:${active ? '#f2a65a' : '#0b3d4a'};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
      <span style="font-size:10px;font-weight:700;color:#0b3d4a;background:rgba(255,255,255,.92);padding:1px 5px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15)">${name.split(' ')[0]}</span>
    </div>`,
    iconSize: [60, 32],
    iconAnchor: [30, 7],
  })

function FitBounds({
  points,
  enabled,
}: {
  points: { lat: number; lng: number }[]
  enabled: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (!enabled || !points.length) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.2), { animate: true })
  }, [map, points, enabled])
  return null
}

function FlyToFocus({ focus }: { focus?: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (!focus) return
    map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 9), { duration: 0.8 })
  }, [map, focus])
  return null
}

function MapRecenter({
  center,
  onRecenter,
}: {
  center: { lat: number; lng: number }
  onRecenter?: () => void
}) {
  const map = useMap()
  useEffect(() => {
    const Control = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create('button', 'map-control-btn') as HTMLButtonElement
        btn.type = 'button'
        btn.setAttribute('aria-label', 'Recenter map')
        btn.textContent = '⊕'
        L.DomEvent.disableClickPropagation(btn)
        btn.onclick = () => {
          map.flyTo([center.lat, center.lng], 7, { duration: 0.6 })
          onRecenter?.()
        }
        return btn
      },
    })
    const control = new Control({ position: 'bottomright' })
    control.addTo(map)
    return () => {
      control.remove()
    }
  }, [map, center.lat, center.lng, onRecenter])
  return null
}

type Props = {
  status: TripStatus
  users: Record<string, LiveUser>
  spots: TouristSpot[]
  mapSpots?: TouristSpot[]
  agreedPlans: TripPlan[]
  focus?: { lat: number; lng: number } | null
  selectedSpotId?: string | null
  excludeTravelerId?: string | null
  variant?: 'embedded' | 'fullscreen'
  autoFit?: boolean
  onSpotSelect?: (spot: TouristSpot) => void
  onRecenter?: () => void
}

export function TripMap({
  status,
  users,
  spots,
  mapSpots,
  agreedPlans,
  focus,
  selectedSpotId,
  excludeTravelerId,
  variant = 'embedded',
  autoFit = true,
  onSpotSelect,
  onRecenter,
}: Props) {
  const you = youPosition(status)
  const dest = destinationPosition(status)
  const activeSegment = resolveSegment(status)
  const now = Date.now()
  const displaySpots = mapSpots ?? spots
  const legSpotIds = useMemo(() => new Set(spots.map((s) => s.id)), [spots])

  const activeStops = useMemo(() => {
    const here = status.whereWeAre
    const headed = status.headedTo
    return new Set(
      [here, headed].filter((s) => s !== 'En route' && s !== 'Home'),
    )
  }, [status.whereWeAre, status.headedTo])

  const liveUsers = useMemo(
    () =>
      Object.entries(users).filter(([id, u]) => {
        if (!u.sharing) return false
        if (!excludeTravelerId) return true
        return u.travelerId !== excludeTravelerId && id !== excludeTravelerId
      }),
    [users, excludeTravelerId],
  )

  const points = useMemo(() => {
    const list = [you]
    if (dest) list.push(dest)
    liveUsers.forEach(([, u]) => list.push({ lat: u.lat, lng: u.lng }))
    displaySpots.forEach((s) => list.push({ lat: s.lat, lng: s.lng }))
    if (focus) list.push(focus)
    return list
  }, [you, dest, liveUsers, displaySpots, focus])

  const activeSegmentCoords = SEGMENT_COORDS[activeSegment] ?? []

  const mapContent = (
    <MapContainer
      center={[you.lat, you.lng]}
      zoom={7}
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={ROUTE_COORDS}
        pathOptions={{ color: '#c084fc', weight: 5, opacity: 0.45, lineCap: 'round' }}
      />
      {activeSegmentCoords.length >= 2 && (
        <Polyline
          positions={activeSegmentCoords}
          pathOptions={{ color: '#fbbf24', weight: 8, opacity: 0.95, lineCap: 'round' }}
        />
      )}
      {STOPS.filter((s) => s.id !== 'Home').map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon(stop.id, activeStops.has(stop.id))}
          eventHandlers={{
            click: () => {
              onSpotSelect?.({
                id: `stop-${stop.id}`,
                name: stop.id,
                lat: stop.lat,
                lng: stop.lng,
                segment: activeSegment,
                blurb: `Birthday route stop — ${stop.id}`,
                kind: 'landmark',
              })
            },
          }}
        >
          <Popup>
            <strong>{stop.id}</strong>
            <br />
            {activeStops.has(stop.id) ? 'On this leg of the trip' : 'Tap to explore'}
          </Popup>
        </Marker>
      ))}
      <Marker position={[you.lat, you.lng]} icon={youIcon('#f2a65a', 20)}>
        <Popup>
          <strong>Where we are</strong>
          <br />
          {status.whereWeAre}
        </Popup>
      </Marker>
      {dest && (
        <Marker position={[dest.lat, dest.lng]} icon={destIcon}>
          <Popup>
            <strong>Headed to</strong>
            <br />
            {status.headedTo}
          </Popup>
        </Marker>
      )}
      {liveUsers.map(([id, u]) => {
        const stale = now - u.updatedAt > 2 * 60 * 1000
        return (
          <Marker
            key={id}
            position={[u.lat, u.lng]}
            icon={youIcon(stale ? '#9aa5b1' : u.color)}
            opacity={stale ? 0.55 : 1}
          >
            <Popup>
              <strong>{u.name}</strong>
              <br />
              {stale ? 'Last seen' : 'Live now'}
            </Popup>
          </Marker>
        )
      })}
      {displaySpots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={spotIcon(s.kind, s.id === selectedSpotId, !legSpotIds.has(s.id))}
          opacity={legSpotIds.has(s.id) ? 1 : 0.82}
          eventHandlers={{
            click: () => onSpotSelect?.(s),
          }}
        >
          <Popup className="map-popup" minWidth={240}>
            <SpotDetail spot={s} compact />
          </Popup>
        </Marker>
      ))}
      {agreedPlans
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => (
          <Marker
            key={p.id}
            position={[p.lat!, p.lng!]}
            icon={youIcon('#e07a5f', 14)}
          >
            <Popup>
              <strong>Shannon said yes</strong>
              <br />
              {p.title}
            </Popup>
          </Marker>
        ))}
      <FitBounds points={points} enabled={autoFit && !focus} />
      <FlyToFocus focus={focus} />
      <MapRecenter center={you} onRecenter={onRecenter} />
    </MapContainer>
  )

  if (variant === 'fullscreen') {
    return (
      <div className="map-wrap map-wrap--fullscreen map-wrap--celebrate">
        <div className="map-garland map-garland--top" aria-hidden />
        {mapContent}
      </div>
    )
  }

  return (
    <section className="section" id="map">
      <p className="section-kicker">Live for Shannon</p>
      <h2>Family map</h2>
      <p className="section-lead">
        Pinch, drag, and tap markers to explore the birthday route — everyone
        sharing location shows up live.
      </p>
      <div className="map-wrap">{mapContent}</div>
    </section>
  )
}
