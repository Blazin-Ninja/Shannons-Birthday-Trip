import { motion } from 'framer-motion'

const COLORS = ['#e07a5f', '#f2a65a', '#1a6b6a', '#f7f1e8', '#4a6fa5']

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="confetti-burst" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 17) % 100}%`,
            background: COLORS[i % COLORS.length],
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0.2, rotate: 240 + i * 12 }}
          transition={{ duration: 1.6 + (i % 5) * 0.12, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
