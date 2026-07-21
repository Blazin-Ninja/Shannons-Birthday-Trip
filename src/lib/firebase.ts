import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
  type Database,
} from 'firebase/database'
import { defaultStatus } from './defaults'
import * as mantle from './mantle'
import type { LiveUser, TripPlan, TripStatus } from './types'

export { defaultStatus }

const tripPath = import.meta.env.VITE_TRIP_PATH || 'trips/shannon-birthday-2026'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Database | null = null

export function firebaseEnabled(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.databaseURL &&
      firebaseConfig.projectId,
  )
}

/** True when phones can share live data (Firebase or Mantle cloud sync). */
export function cloudSyncEnabled(): boolean {
  return firebaseEnabled() || mantle.mantleEnabled()
}

export function syncLabel(): string {
  if (firebaseEnabled()) return 'Live sync on (Firebase)'
  if (mantle.mantleEnabled()) return 'Live sync on'
  return 'Local preview sync'
}

function getDb(): Database | null {
  if (!firebaseEnabled()) return null
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
  return db
}

const LS_STATUS = 'sbt-status-v1'
const LS_PLANS = 'sbt-plans-v1'
const LS_USERS = 'sbt-users-v1'

function readLs<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeLs(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

type Unsub = () => void

export function subscribeStatus(cb: (s: TripStatus) => void): Unsub {
  const database = getDb()
  if (database) {
    const r = ref(database, `${tripPath}/status`)
    return onValue(r, (snap) => {
      const val = snap.val() as TripStatus | null
      cb(val ?? defaultStatus)
    })
  }
  if (mantle.mantleEnabled()) return mantle.subscribeStatus(cb)

  cb(readLs(LS_STATUS, defaultStatus))
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_STATUS && e.newValue) {
      cb(JSON.parse(e.newValue) as TripStatus)
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export async function saveStatus(status: TripStatus): Promise<void> {
  const next = { ...status, updatedAt: Date.now() }
  const database = getDb()
  if (database) {
    await set(ref(database, `${tripPath}/status`), next)
    return
  }
  if (mantle.mantleEnabled()) {
    await mantle.saveStatus(next)
    return
  }
  writeLs(LS_STATUS, next)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_STATUS,
      newValue: JSON.stringify(next),
    }),
  )
}

export function subscribeUsers(
  cb: (users: Record<string, LiveUser>) => void,
): Unsub {
  const database = getDb()
  if (database) {
    return onValue(ref(database, `${tripPath}/users`), (snap) => {
      cb((snap.val() as Record<string, LiveUser>) ?? {})
    })
  }
  if (mantle.mantleEnabled()) return mantle.subscribeUsers(cb)

  cb(readLs(LS_USERS, {}))
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_USERS && e.newValue) {
      cb(JSON.parse(e.newValue) as Record<string, LiveUser>)
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export async function publishUser(
  userId: string,
  user: LiveUser,
): Promise<void> {
  const database = getDb()
  if (database) {
    await set(ref(database, `${tripPath}/users/${userId}`), user)
    return
  }
  if (mantle.mantleEnabled()) {
    await mantle.publishUser(userId, user)
    return
  }
  const all = readLs<Record<string, LiveUser>>(LS_USERS, {})
  all[userId] = user
  writeLs(LS_USERS, all)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_USERS,
      newValue: JSON.stringify(all),
    }),
  )
}

export function subscribePlans(cb: (plans: TripPlan[]) => void): Unsub {
  const database = getDb()
  if (database) {
    return onValue(ref(database, `${tripPath}/plans`), (snap) => {
      const val = snap.val() as Record<string, Omit<TripPlan, 'id'>> | null
      if (!val) {
        cb([])
        return
      }
      const list = Object.entries(val).map(([id, p]) => ({ ...p, id }))
      list.sort((a, b) => b.createdAt - a.createdAt)
      cb(list)
    })
  }
  if (mantle.mantleEnabled()) return mantle.subscribePlans(cb)

  cb(readLs(LS_PLANS, []))
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_PLANS && e.newValue) {
      cb(JSON.parse(e.newValue) as TripPlan[])
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export async function createPlan(
  plan: Omit<TripPlan, 'id' | 'createdAt' | 'status'> & {
    status?: TripPlan['status']
  },
): Promise<void> {
  const status = plan.status ?? 'pending'
  const payload = {
    ...plan,
    status,
    createdAt: Date.now(),
  }
  const database = getDb()
  if (database) {
    await push(ref(database, `${tripPath}/plans`), payload)
    return
  }
  if (mantle.mantleEnabled()) {
    await mantle.createPlan(plan)
    return
  }
  const all = readLs<TripPlan[]>(LS_PLANS, [])
  const id = `local-${Date.now()}`
  all.unshift({ ...payload, id })
  writeLs(LS_PLANS, all)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_PLANS,
      newValue: JSON.stringify(all),
    }),
  )
}

export async function decidePlan(
  planId: string,
  status: 'agreed' | 'vetoed',
  decisionNote?: string,
): Promise<void> {
  const database = getDb()
  if (database) {
    await update(ref(database, `${tripPath}/plans/${planId}`), {
      status,
      decidedAt: Date.now(),
      decisionNote: decisionNote ?? null,
    })
    return
  }
  if (mantle.mantleEnabled()) {
    await mantle.decidePlan(planId, status, decisionNote)
    return
  }
  const all = readLs<TripPlan[]>(LS_PLANS, [])
  const next = all.map((p) =>
    p.id === planId
      ? {
          ...p,
          status,
          decidedAt: Date.now(),
          decisionNote,
        }
      : p,
  )
  writeLs(LS_PLANS, next)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_PLANS,
      newValue: JSON.stringify(next),
    }),
  )
}

export async function withdrawPlan(planId: string): Promise<void> {
  const database = getDb()
  if (database) {
    await remove(ref(database, `${tripPath}/plans/${planId}`))
    return
  }
  if (mantle.mantleEnabled()) {
    await mantle.withdrawPlan(planId)
    return
  }
  const all = readLs<TripPlan[]>(LS_PLANS, []).filter((p) => p.id !== planId)
  writeLs(LS_PLANS, all)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_PLANS,
      newValue: JSON.stringify(all),
    }),
  )
}
