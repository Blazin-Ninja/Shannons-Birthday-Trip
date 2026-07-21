import { useState } from 'react'
import { motion } from 'framer-motion'
import { TRAVELERS } from '../data/travelers'
import { tryUnlockDirector } from '../lib/director'
import type { LocalIdentity } from '../lib/types'

type Props = {
  onComplete: (identity: Omit<LocalIdentity, 'userId'>) => void
}

export function UserSetup({ onComplete }: Props) {
  const [selected, setSelected] = useState(TRAVELERS[0].id)
  const [customName, setCustomName] = useState('')
  const [pin, setPin] = useState('')
  const [wantDirector, setWantDirector] = useState(false)
  const [error, setError] = useState('')

  const seed = TRAVELERS.find((t) => t.id === selected) ?? TRAVELERS[0]

  function submit() {
    const name = customName.trim() || seed.name
    let isDirector = false
    if (wantDirector) {
      if (!tryUnlockDirector(pin)) {
        setError('That PIN did not unlock Shannon Director.')
        return
      }
      isDirector = true
    }
    onComplete({
      name,
      color: seed.color,
      avatar: seed.avatar,
      isDirector,
    })
  }

  return (
    <div className="setup-screen">
      <motion.p
        className="section-kicker"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shannon&apos;s Birthday Trip
      </motion.p>
      <motion.h1
        className="display"
        style={{ fontSize: '2.4rem', margin: '0 0 0.5rem', color: 'var(--gulf-teal)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Who&apos;s joining the celebration?
      </motion.h1>
      <p className="section-lead">
        Pick your face for the live map. Location stays on this family trip only —
        and fun plans need Shannon&apos;s OK.
      </p>

      <div className="traveler-grid" style={{ marginBottom: '1rem' }}>
        {TRAVELERS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`traveler-chip ${selected === t.id ? 'selected' : ''}`}
            onClick={() => setSelected(t.id)}
          >
            <img src={t.avatar} alt={t.name} />
            <strong>{t.name}</strong>
            <span className="muted" style={{ fontSize: '0.78rem' }}>
              {t.role}
            </span>
          </button>
        ))}
      </div>

      <div className="panel stack">
        <label className="field">
          Display name
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={seed.name}
          />
        </label>

        <label className="row" style={{ fontWeight: 600, color: 'var(--gulf-teal)' }}>
          <input
            type="checkbox"
            checked={wantDirector}
            onChange={(e) => setWantDirector(e.target.checked)}
          />
          I am Shannon (Director) — unlock Agree / Veto
        </label>

        {wantDirector && (
          <label className="field">
            Director PIN
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Shannon’s PIN"
              autoComplete="off"
            />
          </label>
        )}

        {error && (
          <p className="muted" style={{ color: 'var(--veto)', margin: 0 }}>
            {error}
          </p>
        )}

        <button type="button" className="btn btn-coral" onClick={submit}>
          Start Shannon&apos;s Birthday Trip
        </button>
      </div>
    </div>
  )
}
