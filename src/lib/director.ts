const UNLOCK_KEY = 'sbt-director-unlocked'

export function isDirectorUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === '1'
}

/** Unlock Shannon Director powers on this device (no PIN). */
export function unlockDirector(): void {
  localStorage.setItem(UNLOCK_KEY, '1')
}

export function lockDirector() {
  localStorage.removeItem(UNLOCK_KEY)
}
