import { useEffect, useState } from 'react'
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
    <section className="section trip-section" id="plans">
      <p className="section-kicker">Plans for Shannon</p>
      <h2>Shannon&apos;s call</h2>
      <p className="section-lead">
        Anyone can propose. Shannon agrees or vetoes — it&apos;s her birthday trip.
      </p>

      <div className="panel stack trip-panel" style={{ marginBottom: '1rem' }}>
        <label className="field">
          Idea for Shannon
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beach sunrise, Buc-ee’s run, Fort Pickens…"
          />
        </label>
        <label className="field">
          Place
          <input
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Optional place name"
          />
        </label>
        <label className="field">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why this is perfect for Shannon’s birthday…"
          />
        </label>
        <button type="button" className="btn btn-coral" onClick={() => void submit()}>
          {identity.isDirector ? 'Add (auto-agreed)' : 'Propose for Shannon'}
        </button>
      </div>

      <div className="tabs trip-tabs">
        {(['pending', 'agreed', 'vetoed'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="stack">
        {filtered.length === 0 && (
          <div className="panel trip-panel muted">
            {tab === 'pending'
              ? 'Nothing pending — suggest something for Shannon’s birthday.'
              : tab === 'agreed'
                ? 'Shannon hasn’t green-lit a plan yet.'
                : 'No vetoes. Keep the birthday ideas coming.'}
          </div>
        )}
        {filtered.map((p) => (
          <article key={p.id} className="plan-item trip-plan">
            <div className="row">
              <h3>{p.title}</h3>
              <span className={`badge badge-${p.status}`}>{p.status}</span>
            </div>
            {p.placeName && (
              <p className="muted" style={{ margin: 0 }}>
                {p.placeName}
              </p>
            )}
            {p.notes && <p style={{ margin: 0 }}>{p.notes}</p>}
            <p className="muted" style={{ margin: 0 }}>
              From {p.createdByName}
            </p>
            <div className="row">
              {identity.isDirector && p.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-ok"
                    onClick={() => {
                      void decidePlan(p.id, 'agreed').then(onAgreed)
                    }}
                  >
                    Agree
                  </button>
                  <button
                    type="button"
                    className="btn btn-veto"
                    onClick={() => void decidePlan(p.id, 'vetoed')}
                  >
                    Veto
                  </button>
                </>
              )}
              {p.createdById === identity.userId && p.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void withdrawPlan(p.id)}
                >
                  Withdraw
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
