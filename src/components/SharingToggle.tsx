import { useEffect, useState } from 'react'
import { publishUser } from '../lib/firebase'
import { getCurrentPosition } from '../lib/location'
import type { LocalIdentity } from '../lib/types'

type Props = {
  identity: LocalIdentity
  compact?: boolean
}

export function SharingToggle({ identity, compact }: Props) {
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
      await publishUser(identity.travelerId, {
        name: identity.name,
        color: identity.color,
        avatar: identity.avatar,
        travelerId: identity.travelerId,
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
      void publishUser(identity.travelerId, {
        name: identity.name,
        color: identity.color,
        avatar: identity.avatar,
        travelerId: identity.travelerId,
        lat: 0,
        lng: 0,
        updatedAt: Date.now(),
        sharing: false,
      })
    }
  }, [sharing, identity])

  if (compact) {
    return (
      <div className="sharing-compact">
        <button
          type="button"
          className={`btn ${sharing ? 'btn-coral' : 'btn-primary'}`}
          onClick={() => setSharing((v) => !v)}
        >
          {sharing ? '● Live' : 'Share location'}
        </button>
        {error && (
          <span className="sharing-compact-error" title={error}>
            !
          </span>
        )}
      </div>
    )
  }

  return (
    <section className="section">
      <p className="section-kicker">Share with the birthday crew</p>
      <h2>My live location</h2>
      <p className="section-lead">
        Keep the app open while sharing so Shannon&apos;s trip map stays fresh.
      </p>
      <div className="panel row">
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
