import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Confetti } from '../components/Confetti'
import { Destinations } from '../components/Destinations'
import { DirectorProposalPopup } from '../components/DirectorProposalPopup'
import { MapHub } from '../components/MapHub'
import { NearYou } from '../components/NearYou'
import { Pensacola } from '../components/Pensacola'
import { PlansBoard } from '../components/PlansBoard'
import { Timeline } from '../components/Timeline'
import type { TouristSpot } from '../data/touristSpots'
import { dayIdForStatus } from '../data/driveDays'
import { useIdentity, useLogout } from '../context/IdentityContext'
import {
  createPlan,
  defaultAdventurePicks,
  defaultStatus,
  saveAdventurePicks,
  subscribeAdventurePicks,
  subscribePlans,
  subscribeStatus,
  subscribeUsers,
} from '../lib/firebase'
import {
  loadAmenityRadiusMi,
  saveAmenityRadiusMi,
} from '../lib/amenityRadius'
import {
  distanceFromPoint,
  filterSpotsNearPoint,
  formatDistanceMi,
  pickDiverseNearbyFromPoint,
} from '../lib/nearbySpots'
import { filterSpotsForAmenityRadius } from '../lib/routeDeviation'
import { allMapSpots, resolveSegment, spotsForStatus } from '../lib/segments'
import { useNearbyOrigin } from '../lib/useNearbyOrigin'
import type { AdventurePicks, LiveUser, TripPlan, TripStatus } from '../lib/types'

export function MapHomePage() {
  const identity = useIdentity()
  const logout = useLogout()
  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [users, setUsers] = useState<Record<string, LiveUser>>({})
  const [plans, setPlans] = useState<TripPlan[]>([])
  const [adventurePicks, setAdventurePicks] = useState<AdventurePicks>(() =>
    defaultAdventurePicks(identity.travelerId),
  )
  const [draftSpot, setDraftSpot] = useState<TouristSpot | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [mapFocus, setMapFocus] = useState<{
    lat: number
    lng: number
    spotId: string
  } | null>(null)
  const [amenityRadiusMiles, setAmenityRadiusMiles] = useState(
    () => loadAmenityRadiusMi(),
  )

  const { origin: nearbyOrigin, usingLiveGps } = useNearbyOrigin(
    identity,
    users,
    status,
  )

  useEffect(() => {
    const u1 = subscribeStatus(setStatus)
    const u2 = subscribeUsers(setUsers)
    const u3 = subscribePlans(setPlans)
    const u4 = subscribeAdventurePicks(identity.travelerId, (picks) => {
      setAdventurePicks(picks ?? defaultAdventurePicks(identity.travelerId))
    })
    return () => {
      u1()
      u2()
      u3()
      u4()
    }
  }, [identity.travelerId])

  const legSpots = useMemo(() => spotsForStatus(status), [status])
  const mapSpots = useMemo(
    () => filterSpotsForAmenityRadius(allMapSpots(status), amenityRadiusMiles),
    [status, amenityRadiusMiles],
  )
  const spots = useMemo(
    () => filterSpotsForAmenityRadius(legSpots, amenityRadiusMiles),
    [legSpots, amenityRadiusMiles],
  )

  const nearbyPool = useMemo(
    () =>
      filterSpotsNearPoint(allMapSpots(status), nearbyOrigin, amenityRadiusMiles),
    [status, nearbyOrigin, amenityRadiusMiles],
  )
  const nearbySpots = useMemo(
    () => pickDiverseNearbyFromPoint(nearbyPool, nearbyOrigin, 4),
    [nearbyPool, nearbyOrigin],
  )
  const nearbyDistances = useMemo(
    () =>
      Object.fromEntries(
        nearbySpots.map((s) => [
          s.id,
          formatDistanceMi(distanceFromPoint(s, nearbyOrigin)),
        ]),
      ),
    [nearbySpots, nearbyOrigin],
  )

  const activeDayId = useMemo(() => dayIdForStatus(status), [status])
  const savedSpotIds = useMemo(
    () => new Set(adventurePicks.spotIds),
    [adventurePicks.spotIds],
  )

  const handleAmenityRadiusChange = useCallback((miles: number) => {
    const next = Math.max(5, Math.min(50, Math.round(miles)))
    setAmenityRadiusMiles(next)
    saveAmenityRadiusMi(next)
  }, [])

  const toggleSavedSpot = useCallback(
    (spotId: string) => {
      const spotIds = adventurePicks.spotIds.includes(spotId)
        ? adventurePicks.spotIds.filter((id) => id !== spotId)
        : [...adventurePicks.spotIds, spotId]
      void saveAdventurePicks({
        ...adventurePicks,
        spotIds,
        updatedBy: identity.name,
      })
    },
    [adventurePicks, identity.name],
  )

  const agreed = useMemo(
    () => plans.filter((p) => p.status === 'agreed'),
    [plans],
  )
  const pendingForDirector = useMemo(
    () =>
      plans.filter(
        (p) =>
          p.status === 'pending' &&
          identity.isDirector &&
          p.createdById !== identity.userId,
      ).length,
    [plans, identity],
  )

  const celebrateAgreed = useCallback(() => {
    setCelebrate(true)
    window.setTimeout(() => setCelebrate(false), 2200)
  }, [])

  const proposeSpot = useCallback(
    async (spot: TouristSpot) => {
      const autoAgree = identity.isDirector
      await createPlan({
        title: spot.name,
        notes: spot.description ?? spot.blurb,
        placeName: spot.name,
        lat: spot.lat,
        lng: spot.lng,
        segment: spot.segment ?? resolveSegment(status),
        createdById: identity.userId,
        createdByName: identity.name,
        status: autoAgree ? 'agreed' : 'pending',
      })
      if (autoAgree) celebrateAgreed()
    },
    [identity, status, celebrateAgreed],
  )

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleLogout() {
    setMapFocus(null)
    setDraftSpot(null)
    logout()
  }

  return (
    <div className="app-shell app-shell--map-first">
      <Confetti show={celebrate} />
      <DirectorProposalPopup
        identity={identity}
        plans={plans}
        onAgreed={celebrateAgreed}
        onViewPlans={() => scrollToSection('plans')}
      />
      <MapHub
        identity={identity}
        status={status}
        users={users}
        spots={spots}
        nearbySpots={nearbySpots}
        nearbyDistances={nearbyDistances}
        nearbyUsingLiveGps={usingLiveGps}
        savedSpotIds={savedSpotIds}
        onToggleSavedSpot={toggleSavedSpot}
        savedAdventureCount={adventurePicks.spotIds.length}
        mapSpots={mapSpots}
        amenityRadiusMiles={amenityRadiusMiles}
        onAmenityRadiusChange={handleAmenityRadiusChange}
        agreedPlans={agreed}
        pendingPlanCount={pendingForDirector}
        onLocalUpdate={setStatus}
        onPropose={(spot) => void proposeSpot(spot)}
        onScrollTo={scrollToSection}
        externalFocus={mapFocus}
        onLogout={handleLogout}
      />

      <div className="below-map storybook-zone">
        <NearYou
          spots={nearbySpots}
          distances={nearbyDistances}
          usingLiveGps={usingLiveGps}
          amenityRadiusMiles={amenityRadiusMiles}
          savedSpotIds={savedSpotIds}
          savedCount={adventurePicks.spotIds.length}
          activeDayId={activeDayId}
          onPropose={(spot) => void proposeSpot(spot)}
          onToggleSaved={toggleSavedSpot}
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
          onAgreed={celebrateAgreed}
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
          <Link to="/drive" className="btn btn-toon-primary footer-drive-link">
            Drive playbook
          </Link>
          <button type="button" className="btn btn-logout" onClick={handleLogout}>
            Switch traveler
          </button>
        </footer>
      </div>
    </div>
  )
}
