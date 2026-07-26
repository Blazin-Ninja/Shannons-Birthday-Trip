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
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [spotQuery, setSpotQuery] = useState('')

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
  const filteredSpots = useMemo(() => {
    const query = spotQuery.trim().toLowerCase()
    if (!query) return availableSpots
    return availableSpots.filter((spot) =>
      [spot.name, spot.brand, spot.blurb, spot.kind]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    )
  }, [availableSpots, spotQuery])
  const arrival = schedule.at(-1)?.at
  const totalVisitMinutes = orderedStops.reduce(
    (total, spot) =>
      total +
      (plan.dwellOverrides?.[spot.id] ?? dwellMinutesForSpot(spot)),
    0,
  )
  const dayIndex = Math.max(
    0,
    Number.parseInt(dayId.replace('d', ''), 10) - 1,
  )
  const previousDayId = dayIndex > 0 ? `d${dayIndex}` : null
  const nextDayId = dayIndex < 6 ? `d${dayIndex + 2}` : null

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
    setSaveState('saving')
    try {
      await saveDrivePlan({ ...next, updatedBy: identity.name })
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1800)
    } catch {
      setSaveState('error')
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

  const routeUrl = (() => {
    const waypoints = orderedStops
      .map((spot) => `${spot.lat},${spot.lng}`)
      .join('|')
    const params = new URLSearchParams({
      api: '1',
      origin: config.startCity,
      destination: config.endCity,
      travelmode: 'driving',
    })
    if (waypoints) params.set('waypoints', waypoints)
    return `https://www.google.com/maps/dir/?${params.toString()}`
  })()

  return (
    <div className="planner-shell">
      <header className="planner-topbar">
        <Link to="/drive" className="planner-brand" aria-label="Back to all days">
          <span className="planner-brand-mark" aria-hidden>
            S
          </span>
          <span>
            <small>Shannon&apos;s birthday trip</small>
            Day planner
          </span>
        </Link>
        <Link to="/" className="planner-map-link">
          <span aria-hidden>⌖</span> Live map
        </Link>
      </header>

      <main className="drive-page drive-page--detail">
        <nav className="drive-day-nav" aria-label="Day navigation">
          {previousDayId ? (
            <Link to={`/drive/${previousDayId}`}>← Day {dayIndex}</Link>
          ) : (
            <span />
          )}
          <Link to="/drive">All days</Link>
          {nextDayId ? (
            <Link to={`/drive/${nextDayId}`}>Day {dayIndex + 2} →</Link>
          ) : (
            <span />
          )}
        </nav>

        <section className="drive-detail-hero">
          <div className="drive-detail-day">
            <span>{dayIndex + 1}</span>
            <small>{itineraryDay.dateLabel}</small>
          </div>
          <div className="drive-detail-copy">
            <p className="planner-eyebrow">
              {config.isDriveDay ? 'Road day' : 'Explore day'} ·{' '}
              {config.startCity}
              {config.isDriveDay ? ` to ${config.endCity}` : ''}
            </p>
            <h1>{itineraryDay.title}</h1>
            <p>{itineraryDay.detail}</p>
          </div>
          <div
            className={`drive-save-state drive-save-state--${saveState}`}
            role="status"
            aria-live="polite"
          >
            {saveState === 'saving' && '↻ Saving'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && '! Save failed — try again'}
            {saveState === 'idle' && '✓ Shared plan'}
          </div>
        </section>

        <section className="drive-glance-grid" aria-label="Day summary">
          <div>
            <span className="drive-glance-icon" aria-hidden>
              ◷
            </span>
            <span>
              <small>Leave</small>
              <strong>
                {new Date(plan.departAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>
          <div>
            <span className="drive-glance-icon" aria-hidden>
              ⌖
            </span>
            <span>
              <small>Planned stops</small>
              <strong>{orderedStops.length || 'None yet'}</strong>
            </span>
          </div>
          <div>
            <span className="drive-glance-icon" aria-hidden>
              ↗
            </span>
            <span>
              <small>Drive time</small>
              <strong>
                {Math.floor(driveTotal / 60)}h {driveTotal % 60}m
              </strong>
            </span>
          </div>
          <div>
            <span className="drive-glance-icon" aria-hidden>
              ◎
            </span>
            <span>
              <small>Est. arrival</small>
              <strong>{arrival ? formatScheduleTime(arrival) : '—'}</strong>
            </span>
          </div>
        </section>

        <nav className="drive-jump-nav" aria-label="Jump to planner section">
          <a href="#timing">Timing</a>
          <a href="#stops">Add stops</a>
          <a href="#schedule">Schedule</a>
        </nav>

        <div className="drive-planner-layout">
          <div className="drive-planner-main">
            <section className="drive-section drive-editor-card" id="timing">
              <div className="drive-section-heading">
                <span className="drive-section-step">1</span>
                <div>
                  <p className="planner-eyebrow">Set the pace</p>
                  <h2>Departure & route</h2>
                </div>
              </div>
              <label className="field drive-date-field">
                Estimated departure
                <input
                  type="datetime-local"
                  value={plan.departAt}
                  onChange={(event) => updateDepartAt(event.target.value)}
                />
              </label>
              <div className="drive-route-line">
                <span>
                  <small>Start</small>
                  <strong>{config.startCity}</strong>
                </span>
                <span className="drive-route-dots" aria-hidden>
                  •••••→
                </span>
                <span>
                  <small>Finish</small>
                  <strong>{config.endCity}</strong>
                </span>
              </div>
              <a
                href={routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="drive-maps-button"
              >
                Open this route in Google Maps ↗
              </a>
            </section>

            <section className="drive-section" id="stops">
              <div className="drive-section-heading drive-section-heading--between">
                <div className="drive-section-heading">
                  <span className="drive-section-step">2</span>
                  <div>
                    <p className="planner-eyebrow">Make it yours</p>
                    <h2>Add stops</h2>
                  </div>
                </div>
                <span className="drive-section-count">
                  {orderedStops.length} selected
                </span>
              </div>
              <p className="drive-section-intro">
                Curated for this route. Tap a card to add it to the shared day.
              </p>
              {availableSpots.length > 3 && (
                <label className="drive-search">
                  <span aria-hidden>⌕</span>
                  <span className="sr-only">Search available stops</span>
                  <input
                    type="search"
                    value={spotQuery}
                    onChange={(event) => setSpotQuery(event.target.value)}
                    placeholder="Search beaches, food, museums…"
                  />
                  {spotQuery && (
                    <button
                      type="button"
                      onClick={() => setSpotQuery('')}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </label>
              )}
              <div className="drive-spot-grid">
                {availableSpots.length === 0 && (
                  <div className="drive-empty-state">
                    <span aria-hidden>⌖</span>
                    <strong>No curated stops yet</strong>
                    <p>This day is ready for a relaxed, open schedule.</p>
                  </div>
                )}
                {filteredSpots.length === 0 && availableSpots.length > 0 && (
                  <div className="drive-empty-state">
                    <strong>No matching stops</strong>
                    <p>Try a different search or clear the filter.</p>
                  </div>
                )}
                {filteredSpots.map((spot) => {
                  const selected = plan.stopIds.includes(spot.id)
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      className={`drive-spot-card ${selected ? 'selected' : ''}`}
                      onClick={() => toggleSpot(spot.id)}
                      aria-pressed={selected}
                    >
                      <span className="drive-spot-check" aria-hidden>
                        {selected ? '✓' : '+'}
                      </span>
                      <span className="drive-spot-card-copy">
                        <small>{spot.brand || spot.kind}</small>
                        <strong>{spot.name}</strong>
                        <span>{spot.blurb}</span>
                      </span>
                      <span className="drive-spot-duration">
                        ~{dwellMinutesForSpot(spot)} min
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {orderedStops.length > 0 && (
              <section className="drive-section" id="order">
                <div className="drive-section-heading">
                  <span className="drive-section-step">3</span>
                  <div>
                    <p className="planner-eyebrow">Fine tune</p>
                    <h2>Stop order & visit time</h2>
                  </div>
                </div>
                <p className="drive-section-intro">
                  Put stops in road order and leave enough time to enjoy each one.
                </p>
                <div className="drive-stop-order">
                  {orderedStops.map((spot, index) => (
                    <div key={spot.id} className="drive-stop-row">
                      <div className="drive-stop-index">{index + 1}</div>
                      <div className="drive-stop-info">
                        <strong>{spot.name}</strong>
                        <label className="drive-dwell-field">
                          <span>Visit</span>
                          <input
                            type="number"
                            min={5}
                            step={5}
                            defaultValue={
                              plan.dwellOverrides?.[spot.id] ??
                              dwellMinutesForSpot(spot)
                            }
                            key={`${spot.id}-${plan.dwellOverrides?.[spot.id] ?? dwellMinutesForSpot(spot)}`}
                            onBlur={(event) =>
                              setDwell(spot.id, Number(event.target.value) || 5)
                            }
                          />
                          <span>min</span>
                        </label>
                      </div>
                      <div className="drive-stop-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveStop(index, -1)}
                          aria-label={`Move ${spot.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === orderedStops.length - 1}
                          onClick={() => moveStop(index, 1)}
                          aria-label={`Move ${spot.name} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="drive-stop-remove"
                          onClick={() => removeStop(spot.id)}
                          aria-label={`Remove ${spot.name}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="drive-schedule-column" id="schedule">
            <section className="drive-schedule-card">
              <div className="drive-schedule-head">
                <div>
                  <p className="planner-eyebrow">Live preview</p>
                  <h2>Day schedule</h2>
                </div>
                <span>{orderedStops.length} stops</span>
              </div>
              <p className="drive-schedule-summary">
                {Math.floor(driveTotal / 60)}h {driveTotal % 60}m driving
                {totalVisitMinutes > 0
                  ? ` · ${Math.floor(totalVisitMinutes / 60)}h ${
                      totalVisitMinutes % 60
                    }m exploring`
                  : ''}
              </p>
              <div className="drive-schedule">
                {schedule.map((block, index) => (
                  <motion.article
                    key={`${block.kind}-${block.at.getTime()}-${index}`}
                    className={`drive-schedule-item drive-schedule-${block.kind}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <time className="drive-schedule-time">
                      {formatScheduleTime(block.at)}
                    </time>
                    <div className="drive-schedule-body">
                      <p className="drive-schedule-label">{block.label}</p>
                      {block.minutes != null && block.kind !== 'depart' && (
                        <p className="drive-schedule-duration">
                          {block.kind === 'departStop' ? 'Visit' : 'Drive'} ·{' '}
                          ~{block.minutes} min
                        </p>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
              <div className="drive-arrival-card">
                <span>
                  <small>Estimated arrival</small>
                  <strong>{arrival ? formatScheduleTime(arrival) : '—'}</strong>
                </span>
                <span aria-hidden>🏁</span>
              </div>
            </section>
          </aside>
        </div>

        <nav className="drive-bottom-nav" aria-label="Continue planning">
          {previousDayId ? (
            <Link to={`/drive/${previousDayId}`}>
              <small>Previous</small>
              <strong>← Day {dayIndex}</strong>
            </Link>
          ) : (
            <Link to="/">
              <small>Back to</small>
              <strong>← Live map</strong>
            </Link>
          )}
          {nextDayId ? (
            <Link to={`/drive/${nextDayId}`}>
              <small>Next</small>
              <strong>Day {dayIndex + 2} →</strong>
            </Link>
          ) : (
            <Link to="/drive">
              <small>Review</small>
              <strong>All days →</strong>
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}
