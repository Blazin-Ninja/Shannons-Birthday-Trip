import { useState, type CSSProperties } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TRAVELERS } from '../data/travelers'
import { unlockDirector, lockDirector } from '../lib/director'
import type { LocalIdentity } from '../lib/types'

type Props = {
  onComplete: (identity: Omit<LocalIdentity, 'userId'>) => void
}

const pop = { type: 'spring' as const, stiffness: 520, damping: 16, mass: 0.9 }
const soft = { type: 'spring' as const, stiffness: 280, damping: 22 }

export function UserSetup({ onComplete }: Props) {
  const reduceMotion = useReducedMotion()
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
    <div className="party-launch">
      <div className="party-stage" aria-hidden>
        <div className="party-sun" />
        <div className="party-ray party-ray-a" />
        <div className="party-ray party-ray-b" />
        <div className="party-ray party-ray-c" />

        <div className="party-streamer party-streamer-l" />
        <div className="party-streamer party-streamer-r" />

        <div className="party-balloon party-balloon-1" />
        <div className="party-balloon party-balloon-2" />
        <div className="party-balloon party-balloon-3" />
        <div className="party-balloon party-balloon-4" />
        <div className="party-balloon party-balloon-5" />

        <div className="party-hill party-hill-back" />
        <div className="party-hill party-hill-front" />
        <div className="party-wave" />

        <div className="party-confetti-layer">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`party-bit party-bit-${(i % 5) + 1}`} />
          ))}
        </div>
      </div>

      <div className="party-content">
        <header className="party-hero">
          <motion.p
            className="party-brand"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.55, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={pop}
          >
            Shannon&apos;s
            <span className="party-brand-line">Birthday Trip</span>
          </motion.p>

          <motion.p
            className="party-tag"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...soft, delay: 0.12 }}
          >
            Gulf adventure · family celebration
          </motion.p>
        </header>

        <motion.section
          className="party-cast"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...soft, delay: 0.18 }}
        >
          <h1 className="party-ask">Who&apos;s coming?</h1>
          <div className="party-faces" role="listbox" aria-label="Choose traveler">
            {TRAVELERS.map((t, i) => {
              const active = selected === t.id
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`party-face ${active ? 'is-on' : ''}`}
                  style={{ '--face': t.color } as CSSProperties}
                  onClick={() => pickTraveler(t.id)}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: active ? 1.08 : 1 }}
                  transition={{ ...pop, delay: reduceMotion ? 0 : 0.16 + i * 0.04 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                >
                  <span className="party-face-ring">
                    <motion.img
                      src={t.avatar}
                      alt=""
                      animate={
                        active && !reduceMotion
                          ? { y: [0, -5, 0], rotate: [0, -4, 4, 0] }
                          : { y: 0, rotate: 0 }
                      }
                      transition={
                        active && !reduceMotion
                          ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                          : soft
                      }
                    />
                  </span>
                  <span className="party-face-name">{t.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          className="party-form"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...soft, delay: 0.28 }}
        >
          <label className="party-field">
            <span>Your name on the map</span>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={seed.name}
              autoComplete="nickname"
              enterKeyHint="done"
            />
          </label>

          <button
            type="button"
            className={`party-director ${wantDirector ? 'is-on' : ''}`}
            onClick={() => setWantDirector((v) => !v)}
            aria-pressed={wantDirector}
          >
            <span className="party-director-knob" aria-hidden />
            <span className="party-director-copy">
              <strong>I&apos;m Shannon</strong>
              <small>Director · Agree &amp; Veto</small>
            </span>
          </button>

          <AnimatePresence>
            {wantDirector && (
              <motion.p
                className="party-director-ok"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                Birthday director unlocked — let&apos;s party!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      <div className="party-dock">
        <motion.button
          type="button"
          className="party-go"
          onClick={submit}
          whileTap={reduceMotion ? undefined : { scale: 0.96, y: 3 }}
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -4, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          Start the celebration
        </motion.button>
      </div>
    </div>
  )
}
