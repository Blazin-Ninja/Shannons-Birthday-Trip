import { useEffect, useMemo, useState } from 'react'
import { watchPosition } from './location'
import { youPosition } from './segments'
import type { LiveUser, LocalIdentity, TripStatus } from './types'

export function useNearbyOrigin(
  identity: LocalIdentity,
  users: Record<string, LiveUser>,
  status: TripStatus,
) {
  const [devicePosition, setDevicePosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    void watchPosition((pos) => {
      if (!cancelled) setDevicePosition(pos)
    }).then((s) => {
      stop = s
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  const myLivePosition = useMemo(() => {
    const live = users[identity.travelerId]
    if (!live?.sharing) return null
    if (live.lat === 0 && live.lng === 0) return null
    return { lat: live.lat, lng: live.lng }
  }, [users, identity.travelerId])

  const origin = myLivePosition ?? devicePosition ?? youPosition(status)
  const usingLiveGps = Boolean(myLivePosition ?? devicePosition)

  return { origin, usingLiveGps, myLivePosition, devicePosition }
}
