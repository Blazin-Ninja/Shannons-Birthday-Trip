import { useState } from 'react'
import { motion } from 'framer-motion'
import { FAMILY_CARTOON_HERO, TRAVELERS } from '../data/travelers'
import { tryUnlockDirector } from '../lib/director'
import type { LocalIdentity } from '../lib/types'
import { CartoonFrame } from './CartoonFrame'

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
    <motion.div className="setup-screen setup-screen--toon">
      <div className="setup-deco setup-deco--balloon setup-deco--1" aria-hidden>
        🎈
      </div>
      <div className="setup-deco setup-deco--balloon setup-deco--2" aria-hidden>
        🎉
      </div>
      <div className="setup-deco setup-deco--star setup-deco--3" aria-hidden>
        ✨
      </div>

      <motion.div
        className="setup-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <CartoonFrame
          src={FAMILY_CARTOON_HERO}
          alt="Shannon's birthday crew — Sophia, William, Shannon, and Ellie"
          variant="hero"
          native
        />
        <div className="setup-hero-badge">Birthday adventure!</div>
      </motion.div>

      <motion.p
        className="toon-kicker"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shannon&apos;s Birthday Trip
      </motion.p>
      <motion.h1
        className="toon-title setup-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Who&apos;s joining the celebration?
      </motion.h1>
      <p className="toon-lead setup-lead">
        Pick your cartoon face for the live map. Location stays on this family
        trip only — and fun plans need Shannon&apos;s OK.
      </p>

      <div className="traveler-grid traveler-grid--toon">
        {TRAVELERS.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            className={`traveler-chip traveler-chip--toon ${selected === t.id ? 'selected' : ''}`}
            onClick={() => setSelected(t.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.06, type: 'spring', stiffness: 260 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            style={{ '--chip-color': t.color } as React.CSSProperties}
          >
            <CartoonFrame src={t.avatar} alt={t.name} native />
            <strong>{t.name}</strong>
            <span className="traveler-role">{t.role}</span>
          </motion.button>
        ))}
      </div>

      <motion.div
        className="toon-card setup-form"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label className="field field--toon">
          Display name
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={seed.name}
          />
        </label>

        <label className="row setup-director-check">
          <input
            type="checkbox"
            checked={wantDirector}
            onChange={(e) => setWantDirector(e.target.checked)}
          />
          I am Shannon (Director) — unlock Agree / Veto
        </label>

        {wantDirector && (
          <label className="field field--toon">
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

        {error && <p className="setup-error">{error}</p>}

        <button type="button" className="btn btn-toon-coral setup-start-btn" onClick={submit}>
          🎂 Start Shannon&apos;s Birthday Trip
        </button>
      </motion.div>
    </motion.div>
  )
}
