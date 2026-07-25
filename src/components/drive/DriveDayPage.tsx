import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  defaultDrivePlan,
  getDriveDayConfig,
  getItineraryDay,
  spotsForDriveDay,
} from '../../data/driveDays'
import { dwellMinutesForSpot, spotById } from '../../data/touristSpots'
import { useIdentity } from '../../context/IdentityContext'
import {
  buildDriveSchedule,
  formatScheduleTime,
  totalDriveMinutes,
} from '../../lib/driveSchedule'
import { saveDrivePlan, subscribeDrivePlan, subscribeStatus, defaultStatus } from '../../lib/firebase'
import type { DriveDayPlan, TripStatus } from '../../lib/types'

export function DriveDayPage() {
  const { dayId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const identity = useIdentity()
  const itineraryDay = getItineraryDay(dayId)
  const config = getDriveDayConfig(dayId)

  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [remotePlan, setRemotePlan] = useState<DriveDayPlan | null>(null)
  const [plan, setPlan] = useState<DriveDayPlan>(() => defaultDrivePlan(dayId))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return subscribeStatus(setStatus)
  }, [])

  useEffect(() => {
    if (!dayId) return
    return subscribeDrivePlan(dayId, setRemotePlan)
  }, [dayId])

  useEffect(() => {
    if (!dayId) return
    if (remotePlan) {
      setPlan(remotePlan)
      return
    }
    setPlan(defaultDrivePlan(dayId))
  }, [dayId, remotePlan])

  useEffect(() => {
    const addSpotId = (location.state as { addSpotId?: string } | null)
      ?.addSpotId
    if (!addSpotId || !dayId) return
    setPlan((prev) => {
      if (prev.stopIds.includes(addSpotId)) return prev
      return { ...prev, stopIds: [...prev.stopIds, addSpotId] }
    })
    navigate(location.pathname, { replace: true, state: {} })
  }, [dayId, location.pathname, location.state, navigate])

  const availableSpots = useMemo(
    () => spotsForDriveDay(dayId, status.viaDfw),
    [dayId, status.viaDfw],
  )

  const orderedStops = useMemo(
    () =>
      plan.stopIds
        .map((id) => spotById(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [plan.stopIds],
  )

  const schedule = useMemo(() => buildDriveSchedule(plan), [plan])
  const driveTotal = useMemo(() => totalDriveMinutes(schedule), [schedule])

  if (!itineraryDay || !config) {
    return (
      <div className="drive-page">
        <header className="drive-header">
          <Link to="/drive" className="drive-back">
            ← All days
          </Link>
          <h1 className="drive-title">Day not found</h1>
        </header>
      </div>
    )
  }

  const persist = async (next: DriveDayPlan) => {
    setPlan(next)
    setSaving(true)
    try {
      await saveDrivePlan({ ...next, updatedBy: identity.name })
    } finally {
      setSaving(false)
    }
  }

  const updateDepartAt = (departAt: string) => {
    void persist({ ...plan, departAt })
  }

  const toggleSpot = (spotId: string) => {
    const stopIds = plan.stopIds.includes(spotId)
      ? plan.stopIds.filter((id) => id !== spotId)
      : [...plan.stopIds, spotId]
    void persist({ ...plan, stopIds })
  }

  const moveStop = (index: number, direction: -1 | 1) => {
    const next = [...plan.stopIds]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    void persist({ ...plan, stopIds: next })
  }

  const removeStop = (spotId: string) => {
    const dwellOverrides = { ...plan.dwellOverrides }
    delete dwellOverrides[spotId]
    void persist({
      ...plan,
      stopIds: plan.stopIds.filter((id) => id !== spotId),
      dwellOverrides,
    })
  }

  const setDwell = (spotId: string, minutes: number) => {
    void persist({
      ...plan,
      dwellOverrides: {
        ...plan.dwellOverrides,
        [spotId]: Math.max(5, minutes),
      },
    })
  }

  return (
    <div className="drive-page">
      <header className="drive-header">
        <Link to="/drive" className="drive-back">
          ← All days
        </Link>
        <p className="section-kicker">{itineraryDay.dateLabel}</p>
        <h1 className="drive-title">{itineraryDay.title}</h1>
        <p className="section-lead">{itineraryDay.detail}</p>
        {saving && <p className="sync-pill drive-saving">Saving…</p>}
      </header>

      <section className="drive-section panel">
        <h2>Leave time</h2>
        <label className="field">
          Estimated departure
          <input
            type="datetime-local"
            value={plan.departAt}
            onChange={(e) => updateDepartAt(e.target.value)}
          />
        </label>
        <p className="muted">
          {config.isDriveDay
            ? `Route: ${config.startCity} → ${config.endCity}`
            : `Local day in ${config.startCity}`}
          {' · '}
          ~{driveTotal} min driving (est.)
        </p>
      </section>

      <section className="drive-section">
        <h2>Add attractions</h2>
        <p className="section-lead">
          Tap to add or remove stops for this day&apos;s corridor.
        </p>
        <div className="spot-list">
          {availableSpots.length === 0 && (
            <div className="panel muted">No curated spots for this day yet.</div>
          )}
          {availableSpots.map((spot) => {
            const selected = plan.stopIds.includes(spot.id)
            return (
              <button
                key={spot.id}
                type="button"
                className={`spot drive-spot-toggle ${selected ? 'selected' : ''}`}
                onClick={() => toggleSpot(spot.id)}
              >
                <strong>
                  {spot.name}
                  {spot.brand ? ` · ${spot.brand}` : ''}
                </strong>
                <span className="muted">{spot.blurb}</span>
                <span className="drive-spot-meta">
                  {selected ? 'Added · tap to remove' : 'Tap to add'}
                  {' · ~'}
                  {dwellMinutesForSpot(spot)} min visit
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {orderedStops.length > 0 && (
        <section className="drive-section">
          <h2>Stop order</h2>
          <p className="section-lead">
            Reorder how you&apos;ll hit each attraction on the road.
          </p>
          <div className="drive-stop-order">
            {orderedStops.map((spot, index) => (
              <div key={spot.id} className="drive-stop-row panel">
                <div className="drive-stop-index">{index + 1}</div>
                <div className="drive-stop-info">
                  <strong>{spot.name}</strong>
                  <label className="field drive-dwell-field">
                    Visit time (min)
                    <input
                      type="number"
                      min={5}
                      step={5}
                      defaultValue={
                        plan.dwellOverrides?.[spot.id] ??
                        dwellMinutesForSpot(spot)
                      }
                      key={`${spot.id}-${plan.dwellOverrides?.[spot.id] ?? dwellMinutesForSpot(spot)}`}
                      onBlur={(e) =>
                        setDwell(spot.id, Number(e.target.value) || 5)
                      }
                    />
                  </label>
                </div>
                <div className="drive-stop-actions row">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={index === 0}
                    onClick={() => moveStop(index, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={index === orderedStops.length - 1}
                    onClick={() => moveStop(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeStop(spot.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="drive-section drive-playby">
        <h2>Hour-by-hour play-by-play</h2>
        <p className="section-lead">
          Estimated schedule — times shift when you reorder stops or change
          departure.
        </p>
        <div className="drive-schedule">
          {schedule.map((block, i) => (
            <motion.article
              key={`${block.kind}-${block.at.getTime()}-${i}`}
              className={`drive-schedule-item drive-schedule-${block.kind}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <time className="drive-schedule-time">
                {formatScheduleTime(block.at)}
              </time>
              <div className="drive-schedule-body">
                <p className="drive-schedule-label">{block.label}</p>
                {block.minutes != null && block.kind !== 'depart' && (
                  <p className="muted drive-schedule-duration">
                    ~{block.minutes} min
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
