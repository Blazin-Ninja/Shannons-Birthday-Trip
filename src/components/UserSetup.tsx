import { useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TRAVELERS } from '../data/travelers'
import { unlockDirector, lockDirector } from '../lib/director'
import type { LocalIdentity } from '../lib/types'

type Props = {
  onComplete: (identity: Omit<LocalIdentity, 'userId'>) => void
}

const springPop = { type: 'spring' as const, stiffness: 420, damping: 18 }
const softSpring = { type: 'spring' as const, stiffness: 260, damping: 20 }

const BALLOONS = [
  { left: '6%', delay: 0, color: '#ff6b6b', size: 44 },
  { left: '18%', delay: 0.4, color: '#ffd166', size: 36 },
  { left: '78%', delay: 0.2, color: '#4ecdc4', size: 40 },
  { left: '90%', delay: 0.7, color: '#ff8fab', size: 32 },
]

const SPARKLES = [
  { top: '12%', left: '12%' },
  { top: '22%', left: '88%' },
  { top: '48%', left: '4%' },
  { top: '58%', left: '94%' },
  { top: '8%', left: '52%' },
]

export function UserSetup({ onComplete }: Props) {
  const [selected, setSelected] = useState(TRAVELERS[0].id)
  const [customName, setCustomName] = useState('')
  const [wantDirector, setWantDirector] = useState(
    () => Boolean(TRAVELERS[0].isDirectorCandidate),
  )

  const seed = TRAVELERS.find((t) => t.id === selected) ?? TRAVELERS[0]

  function pickTraveler(id: string) {
    const next = TRAVELERS.find((t) => t.id === id) ?? TRAVELERS[0]
    setSelected(id)
    if (next.isDirectorCandidate) setWantDirector(true)
  }

  function submit() {
    const name = customName.trim() || seed.name
    if (wantDirector) unlockDirector()
    else lockDirector()
    onComplete({
      name,
      color: seed.color,
      avatar: seed.avatar,
      isDirector: wantDirector,
    })
  }

  return (
    <div className="setup-screen setup-cartoon">
      <div className="setup-sky" aria-hidden>
        {BALLOONS.map((b, i) => (
          <motion.div
            key={i}
            className="setup-balloon"
            style={
              {
                left: b.left,
                '--balloon': b.color,
                width: b.size,
                height: b.size * 1.25,
              } as CSSProperties
            }
            initial={{ y: 40, opacity: 0 }}
            animate={{
              y: [0, -14, 0],
              opacity: 1,
              rotate: [-4, 4, -4],
            }}
            transition={{
              y: { duration: 3.2 + i * 0.35, repeat: Infinity, ease: 'easeInOut' },
              rotate: {
                duration: 4 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: { delay: b.delay, duration: 0.6 },
            }}
          />
        ))}
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="setup-sparkle"
            style={{ top: s.top, left: s.left }}
            animate={{
              scale: [0.6, 1.25, 0.6],
              opacity: [0.35, 1, 0.35],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 1.8 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
          />
        ))}
        <motion.div
          className="setup-cloud setup-cloud-a"
          animate={{ x: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="setup-cloud setup-cloud-b"
          animate={{ x: [0, -22, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="setup-cartoon-inner">
        <motion.p
          className="setup-brand"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springPop}
        >
          Shannon&apos;s Birthday Trip
        </motion.p>

        <motion.h1
          className="setup-headline"
          initial={{ opacity: 0, y: 28, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...softSpring, delay: 0.08 }}
        >
          Who&apos;s hopping on the adventure?
        </motion.h1>

        <motion.p
          className="setup-lead"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          Pick your face for the live map — then let the birthday magic begin.
          Fun plans still need Shannon&apos;s OK!
        </motion.p>

        <div className="traveler-grid setup-traveler-grid">
          {TRAVELERS.map((t, i) => {
            const active = selected === t.id
            return (
              <motion.button
                key={t.id}
                type="button"
                className={`traveler-chip setup-chip ${active ? 'selected' : ''}`}
                onClick={() => pickTraveler(t.id)}
                initial={{ opacity: 0, y: 36, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: active ? 1.06 : 1,
                }}
                transition={{ ...springPop, delay: 0.12 + i * 0.05 }}
                whileHover={{ y: -6, scale: active ? 1.08 : 1.04 }}
                whileTap={{ scale: 0.94 }}
              >
                <motion.img
                  src={t.avatar}
                  alt={t.name}
                  animate={
                    active
                      ? { y: [0, -6, 0], rotate: [0, -3, 3, 0] }
                      : { y: 0, rotate: 0 }
                  }
                  transition={
                    active
                      ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                      : softSpring
                  }
                />
                <strong>{t.name}</strong>
                <span className="muted" style={{ fontSize: '0.78rem' }}>
                  {t.role}
                </span>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          className="panel stack setup-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...softSpring, delay: 0.35 }}
        >
          <label className="field">
            Display name
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={seed.name}
            />
          </label>

          <motion.label
            className="row setup-director"
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              checked={wantDirector}
              onChange={(e) => setWantDirector(e.target.checked)}
            />
            <span>
              I am Shannon (Director) — unlock Agree / Veto
            </span>
          </motion.label>

          <AnimatePresence>
            {wantDirector && (
              <motion.p
                className="setup-director-note"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                Director powers unlocked on this phone. Happy birthday, Shannon!
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            className="btn btn-coral setup-cta"
            onClick={submit}
            whileHover={{ scale: 1.04, rotate: [-1, 1, 0] }}
            whileTap={{ scale: 0.96 }}
            animate={{
              boxShadow: [
                '0 10px 0 #c95d45, 0 14px 28px rgba(224, 122, 95, 0.35)',
                '0 14px 0 #c95d45, 0 20px 32px rgba(224, 122, 95, 0.4)',
                '0 10px 0 #c95d45, 0 14px 28px rgba(224, 122, 95, 0.35)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Let&apos;s go celebrate!
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
