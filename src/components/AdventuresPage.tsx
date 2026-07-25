import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useIdentity } from '../context/IdentityContext'
import { SPOT_KIND_META } from '../data/spotKinds'
import { spotById } from '../data/touristSpots'
import {
  defaultAdventurePicks,
  saveAdventurePicks,
  subscribeAdventurePicks,
  subscribeStatus,
  subscribeUsers,
  defaultStatus,
} from '../lib/firebase'
import {
  loadAmenityRadiusMi,
  saveAmenityRadiusMi,
} from '../lib/amenityRadius'
import {
  distanceFromPoint,
  filterSpotsNearPoint,
  formatDistanceMi,
  sortSpotsByDistanceFrom,
} from '../lib/nearbySpots'
import { useNearbyOrigin } from '../lib/useNearbyOrigin'
import { allMapSpots } from '../lib/segments'
import type { AdventurePicks, LiveUser, TripStatus } from '../lib/types'
import { SpotDetail } from './SpotDetail'

export function AdventuresPage() {
  const identity = useIdentity()
  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [users, setUsers] = useState<Record<string, LiveUser>>({})
  const [remotePicks, setRemotePicks] = useState<AdventurePicks | null>(null)
  const [picks, setPicks] = useState<AdventurePicks>(() =>
    defaultAdventurePicks(identity.travelerId),
  )
  const [saving, setSaving] = useState(false)
  const [amenityRadiusMiles, setAmenityRadiusMiles] = useState(
    () => loadAmenityRadiusMi(),
  )

  useEffect(() => {
    return subscribeStatus(setStatus)
  }, [])

  useEffect(() => {
    return subscribeUsers(setUsers)
  }, [])

  useEffect(() => {
    return subscribeAdventurePicks(identity.travelerId, setRemotePicks)
  }, [identity.travelerId])

  useEffect(() => {
    if (remotePicks) {
      setPicks(remotePicks)
      return
    }
    setPicks(defaultAdventurePicks(identity.travelerId))
  }, [identity.travelerId, remotePicks])

  const { origin, usingLiveGps } = useNearbyOrigin(identity, users, status)

  const nearbyPool = useMemo(
    () =>
      sortSpotsByDistanceFrom(
        filterSpotsNearPoint(
          allMapSpots(status),
          origin,
          amenityRadiusMiles,
        ),
        origin,
      ),
    [status, origin, amenityRadiusMiles],
  )

  const savedSpots = useMemo(
    () =>
      picks.spotIds
        .map((id) => spotById(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [picks.spotIds],
  )

  const persist = async (next: AdventurePicks) => {
    setPicks(next)
    setSaving(true)
    try {
      await saveAdventurePicks({ ...next, updatedBy: identity.name })
    } finally {
      setSaving(false)
    }
  }

  const toggleSpot = (spotId: string) => {
    const spotIds = picks.spotIds.includes(spotId)
      ? picks.spotIds.filter((id) => id !== spotId)
      : [...picks.spotIds, spotId]
    void persist({ ...picks, spotIds })
  }

  const removeSaved = (spotId: string) => {
    void persist({
      ...picks,
      spotIds: picks.spotIds.filter((id) => id !== spotId),
    })
  }

  const moveSaved = (index: number, direction: -1 | 1) => {
    const next = [...picks.spotIds]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    void persist({ ...picks, spotIds: next })
  }

  return (
    <div className="adventures-page">
      <header className="adventures-header">
        <Link to="/" className="adventures-back">← Back to map</Link>
        <h1 className="adventures-title">My nearby adventures</h1>
        <p className="adventures-lead">
          {usingLiveGps
            ? 'Spots within range of your live location — save the ones you can reach.'
            : 'Using trip position until GPS is available — enable location sharing on the map for live updates.'}
        </p>
        {saving && <p className="adventures-saving">Saving…</p>}
      </header>

      <section className="adventures-section">
        <div className="adventures-section-head">
          <h2>Your saved list ({savedSpots.length})</h2>
          <p className="muted">
            Reorder or remove — these are your personal picks for today.
          </p>
        </div>
        {savedSpots.length === 0 && (
          <p className="adventures-empty">
            Nothing saved yet. Browse below and tap Save on spots you want to visit.
          </p>
        )}
        <div className="adventures-saved-list">
          {savedSpots.map((spot, index) => {
            const miles = distanceFromPoint(spot, origin)
            const meta = SPOT_KIND_META[spot.kind]
            return (
              <motion.article
                key={spot.id}
                className="adventures-card adventures-card--saved"
                style={{ '--spot-hue': meta.hue } as React.CSSProperties}
                layout
              >
                <div className="adventures-card-top">
                  <span className="adventures-distance">
                    {formatDistanceMi(miles)} away
                  </span>
                  <div className="adventures-saved-actions">
                    <button
                      type="button"
                      className="btn btn-ghost adventures-icon-btn"
                      disabled={index === 0}
                      onClick={() => moveSaved(index, -1)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost adventures-icon-btn"
                      disabled={index === savedSpots.length - 1}
                      onClick={() => moveSaved(index, 1)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost adventures-icon-btn"
                      onClick={() => removeSaved(spot.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <SpotDetail spot={spot} compact />
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="adventures-section">
        <div className="adventures-section-head">
          <h2>Browse nearby ({nearbyPool.length})</h2>
          <label className="adventures-radius">
            Within
            <select
              value={amenityRadiusMiles}
              onChange={(e) => {
                const next = Number(e.target.value)
                setAmenityRadiusMiles(next)
                saveAmenityRadiusMi(next)
              }}
            >
              {[5, 10, 15, 20, 30, 50].map((mi) => (
                <option key={mi} value={mi}>{mi} mi</option>
              ))}
            </select>
          </label>
        </div>
        <div className="adventures-browse-list">
          {nearbyPool.map((spot) => {
            const saved = picks.spotIds.includes(spot.id)
            const miles = distanceFromPoint(spot, origin)
            const meta = SPOT_KIND_META[spot.kind]
            return (
              <motion.article
                key={spot.id}
                className={`adventures-card ${saved ? 'adventures-card--picked' : ''}`}
                style={{ '--spot-hue': meta.hue } as React.CSSProperties}
                layout
              >
                <div className="adventures-card-top">
                  <span className="adventures-distance">
                    {formatDistanceMi(miles)} away
                  </span>
                  <button
                    type="button"
                    className={`btn ${saved ? 'btn-toon-ghost' : 'btn-toon-primary'}`}
                    onClick={() => toggleSpot(spot.id)}
                  >
                    {saved ? 'Saved ✓' : 'Save'}
                  </button>
                </div>
                <SpotDetail spot={spot} compact />
              </motion.article>
            )
          })}
          {nearbyPool.length === 0 && (
            <p className="adventures-empty">
              No spots within {amenityRadiusMiles} mi — try widening the search radius.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
