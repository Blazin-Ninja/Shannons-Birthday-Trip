import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { decidePlan } from '../lib/firebase'
import type { LocalIdentity, TripPlan } from '../lib/types'

const SEEN_KEY = 'sbt-director-seen-plans'

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function markSeen(id: string) {
  const seen = loadSeen()
  seen.add(id)
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
}

type Props = {
  identity: LocalIdentity
  plans: TripPlan[]
  onAgreed: () => void
  onViewPlans?: () => void
}

export function DirectorProposalPopup({
  identity,
  plans,
  onAgreed,
  onViewPlans,
}: Props) {
  const seenRef = useRef(loadSeen())
  const snoozedRef = useRef<Set<string>>(new Set())
  const [active, setActive] = useState<TripPlan | null>(null)

  const queue = useMemo(() => {
    if (!identity.isDirector) return []
    return plans
      .filter((p) => p.status === 'pending')
      .filter((p) => p.createdById !== identity.userId)
      .filter((p) => !seenRef.current.has(p.id))
      .filter((p) => !snoozedRef.current.has(p.id))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [plans, identity.isDirector, identity.userId])

  useEffect(() => {
    if (!identity.isDirector) {
      setActive(null)
      return
    }
    if (active && queue.some((p) => p.id === active.id)) return
    setActive(queue[0] ?? null)
  }, [identity.isDirector, queue, active])

  async function agree() {
    if (!active) return
    await decidePlan(active.id, 'agreed')
    markSeen(active.id)
    seenRef.current.add(active.id)
    setActive(null)
    onAgreed()
  }

  async function veto() {
    if (!active) return
    await decidePlan(active.id, 'vetoed')
    markSeen(active.id)
    seenRef.current.add(active.id)
    setActive(null)
  }

  function later() {
    if (!active) return
    snoozedRef.current.add(active.id)
    setActive(null)
  }

  if (!identity.isDirector) return null

  return (
    <AnimatePresence>
      {active && (
        <motion.aside
          className="director-proposal-popup"
          role="dialog"
          aria-labelledby="director-proposal-title"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div className="director-proposal-popup-head">
            <span className="director-proposal-popup-badge">New idea for you</span>
            <button
              type="button"
              className="director-proposal-popup-close"
              aria-label="Decide later"
              onClick={later}
            >
              ×
            </button>
          </div>
          <h3 id="director-proposal-title" className="director-proposal-popup-title">
            {active.title}
          </h3>
          {active.placeName && (
            <p className="director-proposal-popup-place">📍 {active.placeName}</p>
          )}
          {active.notes && (
            <p className="director-proposal-popup-notes">{active.notes}</p>
          )}
          <p className="director-proposal-popup-from">
            Proposed by <strong>{active.createdByName}</strong>
          </p>
          <div className="director-proposal-popup-actions">
            <button
              type="button"
              className="btn btn-toon-ok"
              onClick={() => void agree()}
            >
              ✅ Approve
            </button>
            <button
              type="button"
              className="btn btn-toon-veto"
              onClick={() => void veto()}
            >
              ❌ Deny
            </button>
          </div>
          {onViewPlans && (
            <button
              type="button"
              className="director-proposal-popup-link"
              onClick={onViewPlans}
            >
              View all pending plans
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
