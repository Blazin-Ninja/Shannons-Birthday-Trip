import { motion } from 'framer-motion'
import { ALT_HERO_IMAGE, HERO_IMAGE } from '../data/travelers'
import { syncLabel } from '../lib/firebase'

export function Hero() {
  return (
    <header className="hero">
      <motion.div
        className="hero-media"
        style={{ backgroundImage: `url(${HERO_IMAGE}), url(${ALT_HERO_IMAGE})` }}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1.04 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />
      <div className="hero-scrim" />
      <div className="hero-content">
        <motion.p
          className="section-kicker"
          style={{ color: 'rgba(255,255,255,0.85)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          A Gulf road trip celebration
        </motion.p>
        <motion.h1
          className="hero-brand"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          Shannon&apos;s Birthday Trip
        </motion.h1>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          OKC to Pensacola and back — live map, family plans, and every stop
          filtered through Shannon&apos;s call.
        </motion.p>
        <div className="hero-route" aria-hidden>
          <motion.div
            className="hero-route-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
        <div className="sync-pill">{syncLabel()}</div>
      </div>
    </header>
  )
}
