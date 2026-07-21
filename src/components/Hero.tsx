import { motion, useReducedMotion } from 'framer-motion'
import { ALT_HERO_IMAGE, HERO_IMAGE } from '../data/travelers'
import { firebaseEnabled } from '../lib/firebase'

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <header className="hero trip-hero">
      <motion.div
        className="hero-media"
        style={{ backgroundImage: `url(${HERO_IMAGE}), url(${ALT_HERO_IMAGE})` }}
        initial={reduceMotion ? false : { scale: 1.14 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />
      <div className="hero-scrim" />
      <div className="hero-decor" aria-hidden>
        <span className="hero-balloon hero-balloon-a" />
        <span className="hero-balloon hero-balloon-b" />
        <span className="hero-balloon hero-balloon-c" />
      </div>
      <div className="hero-content">
        <motion.p
          className="hero-brand"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        >
          Shannon&apos;s
          <span className="hero-brand-accent">Birthday Trip</span>
        </motion.p>
        <motion.p
          className="hero-sub"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          OKC → Pensacola and back — live map, family plans, Shannon&apos;s call.
        </motion.p>
        <div className="hero-route" aria-hidden>
          <motion.div
            className="hero-route-fill"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 1.1, ease: 'easeInOut' }}
          />
        </div>
        <div className="sync-pill">
          {firebaseEnabled() ? 'Live sync on' : 'Local preview sync'}
        </div>
      </div>
    </header>
  )
}
