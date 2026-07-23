const UNLOCK_KEY = 'sbt-director-unlocked'

export function getDirectorPin(): string {
  return import.meta.env.VITE_SHANNON_DIRECTOR_PIN?.trim() || '5735'
}

export function isDirectorUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === '1'
}

export function tryUnlockDirector(pin: string): boolean {
  if (pin.trim() === getDirectorPin()) {
    localStorage.setItem(UNLOCK_KEY, '1')
    return true
  }
  return false
}

export function lockDirector() {
  localStorage.removeItem(UNLOCK_KEY)
}
