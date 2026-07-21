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
import { ROUTE_COORDS } from '../data/stops'
import type { TouristSpot } from '../data/touristSpots'
import {
  destinationPosition,
  youPosition,
} from '../lib/segments'
import type { LiveUser, TripPlan, TripStatus } from '../lib/types'

const youIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:18px solid #e07a5f;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))"></div>`,
  iconSize: [20, 18],
  iconAnchor: [10, 18],
})

const spotIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:3px;background:#1a6b6a;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function FitBounds({
  points,
}: {
  points: { lat: number; lng: number }[]
}) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.25), { animate: true })
  }, [map, points])
  return null
}

type Props = {
  status: TripStatus
  users: Record<string, LiveUser>
  spots: TouristSpot[]
  agreedPlans: TripPlan[]
  focus?: { lat: number; lng: number } | null
}

export function TripMap({ status, users, spots, agreedPlans, focus }: Props) {
  const you = youPosition(status)
  const dest = destinationPosition(status)
  const now = Date.now()

  const points = useMemo(() => {
    const list = [you]
    if (dest) list.push(dest)
    Object.values(users).forEach((u) => {
      if (u.sharing) list.push({ lat: u.lat, lng: u.lng })
    })
    spots.forEach((s) => list.push({ lat: s.lat, lng: s.lng }))
    if (focus) list.push(focus)
    return list
  }, [you, dest, users, spots, focus])

  return (
    <section className="section trip-section" id="map">
      <p className="section-kicker">Live for Shannon</p>
      <h2>Family map</h2>
      <p className="section-lead">
        See everyone sharing location, where we&apos;re headed, and birthday-trip
        spots near this leg.
      </p>
      <div className="map-wrap trip-map">
        <MapContainer
          center={[you.lat, you.lng]}
          zoom={6}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline
            positions={ROUTE_COORDS}
            pathOptions={{ color: '#0e6b75', weight: 5, opacity: 0.75 }}
          />
          <Marker position={[you.lat, you.lng]} icon={youIcon('#ffd84d')}>
            <Popup>Tagged: {status.whereWeAre}</Popup>
          </Marker>
          {dest && (
            <Marker position={[dest.lat, dest.lng]} icon={destIcon}>
              <Popup>Headed to {status.headedTo}</Popup>
            </Marker>
          )}
          {Object.entries(users).map(([id, u]) => {
            if (!u.sharing) return null
            const stale = now - u.updatedAt > 2 * 60 * 1000
            return (
              <Marker
                key={id}
                position={[u.lat, u.lng]}
                icon={youIcon(stale ? '#9aa5b1' : u.color)}
                opacity={stale ? 0.55 : 1}
              >
                <Popup>
                  {u.name}
                  {stale ? ' · last seen' : ' · live'}
                </Popup>
              </Marker>
            )
          })}
          {spots.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={spotIcon}>
              <Popup>
                <strong>{s.name}</strong>
                <br />
                {s.blurb}
              </Popup>
            </Marker>
          ))}
          {agreedPlans
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => (
              <Marker
                key={p.id}
                position={[p.lat!, p.lng!]}
                icon={youIcon('#ff5a5f')}
              >
                <Popup>
                  Shannon said yes: {p.title}
                </Popup>
              </Marker>
            ))}
          <FitBounds points={points} />
        </MapContainer>
      </div>
    </section>
  )
}
