import { useEffect, useState } from 'react'
import { STOP_PRESETS } from '../data/stops'
import { saveStatus } from '../lib/firebase'
import type { LocalIdentity, TripStatus } from '../lib/types'

type Props = {
  status: TripStatus
  identity: LocalIdentity
  onLocalUpdate: (s: TripStatus) => void
}

export function LiveStatus({ status, identity, onLocalUpdate }: Props) {
  const [draft, setDraft] = useState(status)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(status)
  }, [status])

  async function save() {
    setSaving(true)
    const next = {
      ...draft,
      updatedBy: identity.name,
      updatedAt: Date.now(),
    }
    onLocalUpdate(next)
    await saveStatus(next)
    setSaving(false)
  }

  return (
    <section className="section" id="status">
      <p className="section-kicker">Birthday route desk</p>
      <h2>Where is Shannon&apos;s crew?</h2>
      <p className="section-lead">
        Tag where we are, when we leave, and where we&apos;re headed so everyone
        celebrating with Shannon stays aligned.
      </p>
      <div className="panel stack">
        <label className="field">
          Where we are
          <select
            value={draft.whereWeAre}
            onChange={(e) => setDraft({ ...draft, whereWeAre: e.target.value })}
          >
            {STOP_PRESETS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Leaving at
          <input
            type="datetime-local"
            value={draft.leavingAt}
            onChange={(e) => setDraft({ ...draft, leavingAt: e.target.value })}
          />
        </label>
        <label className="field">
          Headed to
          <select
            value={draft.headedTo}
            onChange={(e) => setDraft({ ...draft, headedTo: e.target.value })}
          >
            {STOP_PRESETS.filter((s) => s !== 'En route').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="row" style={{ fontWeight: 600, color: 'var(--gulf-teal)' }}>
          <input
            type="checkbox"
            checked={Boolean(draft.viaDfw)}
            onChange={(e) => setDraft({ ...draft, viaDfw: e.target.checked })}
          />
          Taking OKC → DFW → Shreveport (extra Buc-ee&apos;s)
        </label>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Update trip status'}
        </button>
        {status.updatedBy && (
          <p className="muted" style={{ margin: 0 }}>
            Last tagged by {status.updatedBy}
          </p>
        )}
      </div>
    </section>
  )
}
