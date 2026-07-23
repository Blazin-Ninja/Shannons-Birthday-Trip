import { useEffect, useMemo, useState } from 'react'
import { Confetti } from './components/Confetti'
import { Destinations } from './components/Destinations'
import { MapHub } from './components/MapHub'
import { NearYou } from './components/NearYou'
import { Pensacola } from './components/Pensacola'
import { PlansBoard } from './components/PlansBoard'
import { Timeline } from './components/Timeline'
import { UserSetup } from './components/UserSetup'
import type { TouristSpot } from './data/touristSpots'
import {
  defaultStatus,
  publishUser,
  subscribePlans,
  subscribeStatus,
  subscribeUsers,
} from './lib/firebase'
import { isDirectorUnlocked, lockDirector } from './lib/director'
import { clearIdentity, loadIdentity, saveIdentity } from './lib/identity'
import { allMapSpots, spotsForStatus } from './lib/segments'
import type { LiveUser, LocalIdentity, TripPlan, TripStatus } from './lib/types'

export default function App() {
  const [identity, setIdentity] = useState<LocalIdentity | null>(() => {
    const loaded = loadIdentity()
    if (!loaded) return null
    return { ...loaded, isDirector: loaded.isDirector && isDirectorUnlocked() }
  })
  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [users, setUsers] = useState<Record<string, LiveUser>>({})
  const [plans, setPlans] = useState<TripPlan[]>([])
  const [draftSpot, setDraftSpot] = useState<TouristSpot | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [mapFocus, setMapFocus] = useState<{
    lat: number
    lng: number
    spotId: string
  } | null>(null)

  useEffect(() => {
    const u1 = subscribeStatus(setStatus)
    const u2 = subscribeUsers(setUsers)
    const u3 = subscribePlans(setPlans)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  const spots = useMemo(() => spotsForStatus(status), [status])
  const mapSpots = useMemo(() => allMapSpots(status), [status])
  const agreed = useMemo(
    () => plans.filter((p) => p.status === 'agreed'),
    [plans],
  )

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleLogout() {
    const current = identity
    if (current) {
      void publishUser(current.travelerId, {
        name: current.name,
        color: current.color,
        avatar: current.avatar,
        travelerId: current.travelerId,
        lat: 0,
        lng: 0,
        updatedAt: Date.now(),
        sharing: false,
      })
    }
    clearIdentity()
    lockDirector()
    setIdentity(null)
    setMapFocus(null)
    setDraftSpot(null)
  }

  if (!identity) {
    return (
      <UserSetup
        onComplete={(partial) => {
          const next = saveIdentity(partial)
          setIdentity(next)
        }}
      />
    )
  }

  return (
    <div className="app-shell app-shell--map-first">
      <Confetti show={celebrate} />
      <MapHub
        identity={identity}
        status={status}
        users={users}
        spots={spots}
        mapSpots={mapSpots}
        agreedPlans={agreed}
        onLocalUpdate={setStatus}
        onPropose={(spot) => {
          setDraftSpot(spot)
          scrollToSection('plans')
        }}
        onScrollTo={scrollToSection}
        externalFocus={mapFocus}
        onLogout={handleLogout}
      />

      <div className="below-map storybook-zone">
        <NearYou
          spots={spots}
          onPropose={(spot) => {
            setDraftSpot(spot)
            scrollToSection('plans')
          }}
          onFocus={(spot) => {
            setMapFocus({ lat: spot.lat, lng: spot.lng, spotId: spot.id })
            scrollToSection('map-hub')
          }}
        />
        <Destinations
          onFocusSpot={(spot) => {
            setMapFocus({ lat: spot.lat, lng: spot.lng, spotId: spot.id })
            scrollToSection('map-hub')
          }}
        />
        <PlansBoard
          identity={identity}
          status={status}
          plans={plans}
          draftSpot={draftSpot}
          onClearDraft={() => setDraftSpot(null)}
          onAgreed={() => {
            setCelebrate(true)
            window.setTimeout(() => setCelebrate(false), 2200)
          }}
        />
        <Timeline />
        <Pensacola />
        <footer className="footer footer--toon">
          <p className="footer-sparkle" aria-hidden>
            ✨ 🎂 ✨
          </p>
          <p className="display footer-title">Happy birthday, Shannon.</p>
          <p className="footer-signed">
            Signed in as <strong>{identity.name}</strong>
            {identity.isDirector ? ' · Director' : ''}
          </p>
          <button type="button" className="btn btn-logout" onClick={handleLogout}>
            Switch traveler
          </button>
        </footer>
      </div>
    </div>
  )
}
