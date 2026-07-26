import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  dayIdForStatus,
  DRIVE_DAY_CONFIGS,
  normalizeDrivePlanDepartAt,
} from '../../data/driveDays'
import { ITINERARY } from '../../data/itinerary'
import {
  defaultStatus,
  subscribeDrivePlan,
  subscribeStatus,
} from '../../lib/firebase'
import type { DriveDayPlan, TripStatus } from '../../lib/types'

export function DriveDayPicker() {
  const [status, setStatus] = useState<TripStatus>(defaultStatus)
  const [plans, setPlans] = useState<Record<string, DriveDayPlan | null>>({})

  useEffect(() => {
    const unsubscribeStatus = subscribeStatus(setStatus)
    const unsubscribePlans = ITINERARY.map((day) =>
      subscribeDrivePlan(day.id, (plan) => {
        setPlans((current) => ({ ...current, [day.id]: plan }))
      }),
    )
    return () => {
      unsubscribeStatus()
      unsubscribePlans.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  const activeDayId = dayIdForStatus(status)
  const activeIndex = ITINERARY.findIndex((day) => day.id === activeDayId)
  const plannedDays = Object.values(plans).filter(
    (plan) => (plan?.stopIds.length ?? 0) > 0,
  ).length

  return (
    <div className="planner-shell">
      <header className="planner-topbar">
        <Link to="/" className="planner-brand" aria-label="Back to live map">
          <span className="planner-brand-mark" aria-hidden>
            S
          </span>
          <span>
            <small>Shannon&apos;s birthday trip</small>
            Trip planner
          </span>
        </Link>
        <Link to="/" className="planner-map-link">
          <span aria-hidden>⌖</span> Live map
        </Link>
      </header>

      <main className="drive-page drive-page--index">
        <section className="planner-hero">
          <div>
            <p className="planner-eyebrow">Your 7-day itinerary</p>
            <h1>Plan less. Enjoy more.</h1>
            <p>
              Keep every drive, stop, and arrival in one shared plan the whole
              family can use on the road.
            </p>
          </div>
          <div className="planner-hero-stats" aria-label="Trip planning summary">
            <span>
              <strong>{plannedDays}</strong>
              <small>days planned</small>
            </span>
            <span>
              <strong>4</strong>
              <small>travel days</small>
            </span>
            <span>
              <strong>3</strong>
              <small>home bases</small>
            </span>
          </div>
        </section>

        <section className="day-progress-card">
          <div className="day-progress-head">
            <span>Trip progress</span>
            <strong>
              Day {activeIndex + 1} of {ITINERARY.length}
            </strong>
          </div>
          <div className="day-progress-track">
            {ITINERARY.map((day, index) => (
              <Link
                key={day.id}
                to={`/drive/${day.id}`}
                className={`day-progress-node ${
                  index < activeIndex
                    ? 'complete'
                    : index === activeIndex
                      ? 'active'
                      : ''
                }`}
                aria-label={`${day.dateLabel}: ${day.title}`}
              >
                <span>{index + 1}</span>
                <small>{day.dateLabel.split(' ')[0]}</small>
              </Link>
            ))}
          </div>
        </section>

        <div className="planner-section-heading">
          <div>
            <p className="planner-eyebrow">Day by day</p>
            <h2>Choose a day to plan</h2>
          </div>
          <p>{plannedDays} of 7 days include saved stops</p>
        </div>

        <div className="drive-day-list">
        {ITINERARY.map((day, i) => {
          const config = DRIVE_DAY_CONFIGS.find((d) => d.dayId === day.id)
          const plan = plans[day.id]
          const stopCount = plan?.stopIds.length ?? 0
          const isActive = day.id === activeDayId
          return (
            <motion.article
              key={day.id}
              className={`drive-day-card ${day.birthdayPeak ? 'peak' : ''} ${
                isActive ? 'active' : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="drive-day-number">
                <span>{i + 1}</span>
                <small>{day.dateLabel}</small>
              </div>
              <div className="drive-day-card-body">
                <div className="drive-day-card-title">
                  <div>
                    <p className="drive-day-type">
                      {config?.isDriveDay ? 'Road day' : 'Explore day'}
                      {isActive ? ' · Current day' : ''}
                    </p>
                    <h3>{day.title}</h3>
                  </div>
                  {day.birthdayPeak && (
                    <span className="drive-day-peak">Birthday peak</span>
                  )}
                </div>
                <p className="drive-day-detail">{day.detail}</p>
                <div className="drive-day-facts">
                  <span>
                    <small>Route</small>
                    <strong>
                      {config?.isDriveDay
                        ? `${config.startCity} → ${config.endCity}`
                        : config?.startCity}
                    </strong>
                  </span>
                  <span>
                    <small>Start</small>
                    <strong>
                      {new Date(
                        normalizeDrivePlanDepartAt(
                          day.id,
                          plan?.departAt ?? config?.defaultDepartAt ?? '',
                        ),
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </strong>
                  </span>
                  <span>
                    <small>Stops</small>
                    <strong>
                      {stopCount ? `${stopCount} planned` : 'Open'}
                    </strong>
                  </span>
                </div>
              </div>
              <Link
                to={`/drive/${day.id}`}
                className={`drive-day-cta ${isActive ? 'active' : ''}`}
              >
                {stopCount ? 'Review plan' : 'Plan day'} <span aria-hidden>→</span>
              </Link>
            </motion.article>
          )
        })}
        </div>
      </main>
    </div>
  )
}
