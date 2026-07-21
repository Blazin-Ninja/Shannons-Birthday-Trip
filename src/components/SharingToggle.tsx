import { useEffect, useState } from 'react'
import { publishUser } from '../lib/firebase'
import { getCurrentPosition } from '../lib/location'
import type { LocalIdentity } from '../lib/types'

type Props = {
  identity: LocalIdentity
}

export function SharingToggle({ identity }: Props) {
  const [sharing, setSharing] = useState(false)
  const [last, setLast] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sharing) return
    let cancelled = false

    async function tick() {
      const pos = await getCurrentPosition()
      if (cancelled) return
      if (!pos) {
        setError('Could not read location. Check permissions and try again.')
        setSharing(false)
        return
      }
      setError('')
      await publishUser(identity.userId, {
        name: identity.name,
        color: identity.color,
        avatar: identity.avatar,
        lat: pos.lat,
        lng: pos.lng,
        updatedAt: Date.now(),
        sharing: true,
      })
      setLast(new Date().toLocaleTimeString())
    }

    void tick()
    const id = window.setInterval(() => void tick(), 8000)
    return () => {
      cancelled = true
      window.clearInterval(id)
      void publishUser(identity.userId, {
        name: identity.name,
        color: identity.color,
        avatar: identity.avatar,
        lat: 0,
        lng: 0,
        updatedAt: Date.now(),
        sharing: false,
      })
    }
  }, [sharing, identity])

  return (
    <section className="section trip-section">
      <p className="section-kicker">Share with the birthday crew</p>
      <h2>My live location</h2>
      <p className="section-lead">
        Keep the app open while sharing so Shannon&apos;s trip map stays fresh.
      </p>
      <div className="panel row trip-panel trip-share">
        <button
          type="button"
          className={`btn ${sharing ? 'btn-coral' : 'btn-primary'}`}
          onClick={() => setSharing((v) => !v)}
        >
          {sharing ? 'Stop sharing' : 'Share my location'}
        </button>
        {last && <span className="muted">Updated {last}</span>}
        {error && (
          <span className="muted" style={{ color: 'var(--veto)' }}>
            {error}
          </span>
        )}
      </div>
    </section>
  )
}
