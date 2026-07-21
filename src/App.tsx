import { useEffect, useMemo, useState } from 'react'
import { Confetti } from './components/Confetti'
import { Hero } from './components/Hero'
import { LiveStatus } from './components/LiveStatus'
import { NearYou } from './components/NearYou'
import { Pensacola } from './components/Pensacola'
import { PlansBoard } from './components/PlansBoard'
import { SharingToggle } from './components/SharingToggle'
import { Timeline } from './components/Timeline'
import { TripMap } from './components/TripMap'
import { UserSetup } from './components/UserSetup'
import type { TouristSpot } from './data/touristSpots'
import {
  defaultStatus,
  subscribePlans,
  subscribeStatus,
  subscribeUsers,
} from './lib/firebase'
import { isDirectorUnlocked, lockDirector } from './lib/director'
import { clearIdentity, loadIdentity, saveIdentity } from './lib/identity'
import { spotsForStatus } from './lib/segments'
import type { LiveUser, LocalIdentity, TripPlan, TripStatus } from './lib/types'

function shouldForceSetup(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('fresh') || params.has('setup') || params.get('reset') === '1'
}

function stripSetupParams() {
  const url = new URL(window.location.href)
  ;['fresh', 'setup', 'reset'].forEach((key) => url.searchParams.delete(key))
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next || url.pathname)
}

export default function App() {
  const [identity, setIdentity] = useState<LocalIdentity | null>(() => {
    if (shouldForceSetup()) {
      clearIdentity()
      lockDirector()
      stripSetupParams()
      return null
    }
    const loaded = loadIdentity()
    if (!loaded) return null
    return { ...loaded, isDirector: loaded.isDirector && isDirectorUnlocked() }
  })
  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [users, setUsers] = useState<Record<string, LiveUser>>({})
  const [plans, setPlans] = useState<TripPlan[]>([])
  const [draftSpot, setDraftSpot] = useState<TouristSpot | null>(null)
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)
  const [celebrate, setCelebrate] = useState(false)

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
  const agreed = useMemo(
    () => plans.filter((p) => p.status === 'agreed'),
    [plans],
  )

  if (!identity) {
    return (
      <UserSetup
        onComplete={( partial) => {
          const next = saveIdentity(partial)
          setIdentity(next)
        }}
      />
    )
  }

  return (
    <div className="app-shell trip-shell">
      <Confetti show={celebrate} />
      <Hero />
      <LiveStatus
        status={status}
        identity={identity}
        onLocalUpdate={setStatus}
      />
      <SharingToggle identity={identity} />
      <TripMap
        status={status}
        users={users}
        spots={spots}
        agreedPlans={agreed}
        focus={focus}
      />
      <NearYou
        spots={spots}
        onPropose={(spot) => {
          setDraftSpot(spot)
          document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
        }}
        onFocus={(spot) => {
          setFocus({ lat: spot.lat, lng: spot.lng })
          document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })
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
      <footer className="footer trip-footer">
        <p className="trip-footer-brand">Happy birthday, Shannon.</p>
        <p className="muted">
          Signed in as {identity.name}
          {identity.isDirector ? ' · Director' : ''}
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: '0.75rem' }}
          onClick={() => {
            clearIdentity()
            lockDirector()
            setIdentity(null)
          }}
        >
          Switch traveler
        </button>
      </footer>
    </div>
  )
}
