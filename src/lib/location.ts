import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

export type GeoPoint = { lat: number; lng: number }

export async function getCurrentPosition(): Promise<GeoPoint | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await Geolocation.requestPermissions()
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        return null
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })
      return { lat: pos.coords.latitude, lng: pos.coords.longitude }
    }

    if (!('geolocation' in navigator)) return null
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
      })
    })
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch {
    return null
  }
}

/** Continuous GPS updates while sharing — returns a stop function. */
export async function watchPosition(
  onPosition: (pos: GeoPoint) => void,
  onError?: (message: string) => void,
): Promise<() => void> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.requestPermissions()
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      onError?.('Location permission denied')
      throw new Error('permission')
    }
    const id = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15000 },
      (position, err) => {
        if (err || !position) {
          onError?.('Could not read GPS')
          return
        }
        onPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
    )
    return () => {
      void Geolocation.clearWatch({ id })
    }
  }

  if (!('geolocation' in navigator)) {
    onError?.('Geolocation not available')
    throw new Error('unavailable')
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    },
    () => onError?.('Could not read location'),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
  )

  return () => navigator.geolocation.clearWatch(watchId)
}
