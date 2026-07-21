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
