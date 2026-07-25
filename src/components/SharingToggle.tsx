import { useEffect, useRef, useState } from 'react'
import { publishUser } from '../lib/firebase'
import { watchPosition } from '../lib/location'
import type { LocalIdentity } from '../lib/types'

type Props = {
  identity: LocalIdentity
  compact?: boolean
}

export function SharingToggle({ identity, compact }: Props) {
  const [sharing, setSharing] = useState(false)
  const [last, setLast] = useState('')
  const [error, setError] = useState('')
  const identityRef = useRef(identity)
  identityRef.current = identity

  useEffect(() => {
    if (!sharing) return

    let cancelled = false
    let stopWatch: (() => void) | null = null

    const publishLive = async (lat: number, lng: number) => {
      const id = identityRef.current
      await publishUser(id.travelerId, {
        name: id.name,
        color: id.color,
        avatar: id.avatar,
        travelerId: id.travelerId,
        lat,
        lng,
        updatedAt: Date.now(),
        sharing: true,
      })
      setLast(new Date().toLocaleTimeString())
    }

    void (async () => {
      try {
        stopWatch = await watchPosition(
          (pos) => {
            if (cancelled) return
            setError('')
            void publishLive(pos.lat, pos.lng)
          },
          (message) => {
            if (cancelled) return
            setError(message)
          },
        )
      } catch {
        if (!cancelled) {
          setError('Could not read location. Check permissions and try again.')
          setSharing(false)
        }
      }
    })()

    return () => {
      cancelled = true
      stopWatch?.()
      const id = identityRef.current
      void publishUser(id.travelerId, {
        name: id.name,
        color: id.color,
        avatar: id.avatar,
        travelerId: id.travelerId,
        lat: 0,
        lng: 0,
        updatedAt: Date.now(),
        sharing: false,
      })
    }
  }, [sharing])

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
        {sharing && last && (
          <span className="sharing-compact-time muted">{last}</span>
        )}
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
