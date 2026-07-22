import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  createPlan,
  decidePlan,
  withdrawPlan,
} from '../lib/firebase'
import { resolveSegment } from '../lib/segments'
import type { LocalIdentity, TripPlan, TripStatus } from '../lib/types'
import type { TouristSpot } from '../data/touristSpots'

type Props = {
  identity: LocalIdentity
  status: TripStatus
  plans: TripPlan[]
  draftSpot: TouristSpot | null
  onClearDraft: () => void
  onAgreed: () => void
}

type Tab = 'pending' | 'agreed' | 'vetoed'

export function PlansBoard({
  identity,
  status,
  plans,
  draftSpot,
  onClearDraft,
  onAgreed,
}: Props) {
  const [tab, setTab] = useState<Tab>('pending')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [placeName, setPlaceName] = useState('')

  useEffect(() => {
    if (!draftSpot) return
    setTitle(draftSpot.name)
    setNotes(draftSpot.blurb)
    setPlaceName(draftSpot.name)
  }, [draftSpot])

  const filtered = plans.filter((p) => p.status === tab)

  async function submit() {
    if (!title.trim()) return
    const autoAgree = identity.isDirector
    await createPlan({
      title: title.trim(),
      notes: notes.trim() || undefined,
      placeName: placeName.trim() || undefined,
      lat: draftSpot?.lat,
      lng: draftSpot?.lng,
      segment: draftSpot?.segment ?? resolveSegment(status),
      createdById: identity.userId,
      createdByName: identity.name,
      status: autoAgree ? 'agreed' : 'pending',
    })
    setTitle('')
    setNotes('')
    setPlaceName('')
    onClearDraft()
    if (autoAgree) onAgreed()
  }

  return (
    <section className="section section--toon" id="plans">
      <p className="toon-kicker">👑 Shannon&apos;s call 👑</p>
      <h2 className="toon-title">Plans for Shannon</h2>
      <p className="toon-lead">
        Anyone can propose. Shannon agrees or vetoes — it&apos;s her birthday
        kingdom.
      </p>

      <motion.div
        className="toon-card toon-compose stack"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <label className="field field--toon">
          Idea for Shannon
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beach sunrise, Buc-ee’s run, Fort Pickens…"
          />
        </label>
        <label className="field field--toon">
          Place
          <input
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Optional place name"
          />
        </label>
        <label className="field field--toon">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why this is perfect for Shannon’s birthday…"
          />
        </label>
        <button type="button" className="btn btn-toon-coral" onClick={() => void submit()}>
          {identity.isDirector ? '✨ Add (auto-agreed)' : '🎂 Propose for Shannon'}
        </button>
      </motion.div>

      <div className="tabs tabs--toon">
        {(['pending', 'agreed', 'vetoed'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tab tab--toon ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? '⏳ pending' : t === 'agreed' ? '✅ agreed' : '❌ vetoed'}
          </button>
        ))}
      </div>

      <div className="stack stack--toon">
        {filtered.length === 0 && (
          <div className="toon-card toon-card--empty">
            <span className="toon-card-emoji" aria-hidden>
              {tab === 'pending' ? '💡' : tab === 'agreed' ? '🎉' : '👍'}
            </span>
            <p>
              {tab === 'pending'
                ? 'Nothing pending — suggest something magical for Shannon’s birthday.'
                : tab === 'agreed'
                  ? 'Shannon hasn’t green-lit a plan yet.'
                  : 'No vetoes. Keep the birthday ideas coming.'}
            </p>
          </div>
        )}
        {filtered.map((p, i) => (
          <motion.article
            key={p.id}
            className={`toon-card plan-item--toon plan-item--${p.status}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="row">
              <h3>{p.title}</h3>
              <span className={`badge badge-${p.status} badge--toon`}>{p.status}</span>
            </div>
            {p.placeName && <p className="plan-item-place">{p.placeName}</p>}
            {p.notes && <p className="plan-item-notes">{p.notes}</p>}
            <p className="plan-item-from">From {p.createdByName}</p>
            <div className="row">
              {identity.isDirector && p.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-toon-ok"
                    onClick={() => {
                      void decidePlan(p.id, 'agreed').then(onAgreed)
                    }}
                  >
                    ✅ Agree
                  </button>
                  <button
                    type="button"
                    className="btn btn-toon-veto"
                    onClick={() => void decidePlan(p.id, 'vetoed')}
                  >
                    ❌ Veto
                  </button>
                </>
              )}
              {p.createdById === identity.userId && p.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-toon-ghost"
                  onClick={() => void withdrawPlan(p.id)}
                >
                  Withdraw
                </button>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
