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
import type { DriveDayPlan, LiveUser, TripPlan, TripStatus } from './types'
import { normalizeLiveUsers } from './liveUsers'

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

export function firebaseStatusLabel(): string {
  if (firebaseEnabled()) {
    return `Live sync · ${firebaseConfig.projectId}`
  }
  if (!firebaseConfig.apiKey && !firebaseConfig.databaseURL) {
    return 'Offline mode · add Firebase config'
  }
  return 'Offline mode · incomplete Firebase config'
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
const LS_DRIVE_PLANS = 'sbt-drive-plans-v1'

export const defaultStatus: TripStatus = {
  whereWeAre: 'Shreveport',
  leavingAt: '2026-07-28T09:00',
  headedTo: 'Shreveport',
  updatedAt: Date.now(),
  viaDfw: false,
}

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

const localStatusListeners = new Set<(s: TripStatus) => void>()
const localUsersListeners = new Set<(u: Record<string, LiveUser>) => void>()
const localPlansListeners = new Set<(p: TripPlan[]) => void>()

function notifyLocalStatus(value: TripStatus) {
  localStatusListeners.forEach((cb) => cb(value))
}

function notifyLocalUsers(all: Record<string, LiveUser>) {
  const normalized = normalizeLiveUsers(all)
  localUsersListeners.forEach((cb) => cb(normalized))
}

function notifyLocalPlans(list: TripPlan[]) {
  localPlansListeners.forEach((cb) => cb(list))
}

export function subscribeStatus(cb: (s: TripStatus) => void): Unsub {
  const database = getDb()
  if (!database) {
    const initial = readLs(LS_STATUS, defaultStatus)
    cb(initial)
    localStatusListeners.add(cb)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_STATUS && e.newValue) {
        cb(JSON.parse(e.newValue) as TripStatus)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      localStatusListeners.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  }
  const r = ref(database, `${tripPath}/status`)
  return onValue(r, (snap) => {
    const val = snap.val() as TripStatus | null
    cb(val ?? defaultStatus)
  })
}

export async function saveStatus(status: TripStatus): Promise<void> {
  const next = { ...status, updatedAt: Date.now() }
  const database = getDb()
  if (!database) {
    writeLs(LS_STATUS, next)
    notifyLocalStatus(next)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LS_STATUS,
        newValue: JSON.stringify(next),
      }),
    )
    return
  }
  await set(ref(database, `${tripPath}/status`), next)
}

export function subscribeUsers(
  cb: (users: Record<string, LiveUser>) => void,
): Unsub {
  const database = getDb()
  if (!database) {
    const initial = normalizeLiveUsers(readLs(LS_USERS, {}))
    cb(initial)
    localUsersListeners.add(cb)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_USERS && e.newValue) {
        cb(
          normalizeLiveUsers(
            JSON.parse(e.newValue) as Record<string, LiveUser>,
          ),
        )
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      localUsersListeners.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  }
  return onValue(ref(database, `${tripPath}/users`), (snap) => {
    cb(normalizeLiveUsers((snap.val() as Record<string, LiveUser>) ?? {}))
  })
}

export async function publishUser(
  userId: string,
  user: LiveUser,
): Promise<void> {
  const database = getDb()
  if (!database) {
    const all = readLs<Record<string, LiveUser>>(LS_USERS, {})
    all[userId] = user
    writeLs(LS_USERS, all)
    notifyLocalUsers(all)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LS_USERS,
        newValue: JSON.stringify(all),
      }),
    )
    return
  }
  await set(ref(database, `${tripPath}/users/${userId}`), user)
}

export function subscribePlans(cb: (plans: TripPlan[]) => void): Unsub {
  const database = getDb()
  if (!database) {
    const initial = readLs(LS_PLANS, [])
    cb(initial)
    localPlansListeners.add(cb)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_PLANS && e.newValue) {
        cb(JSON.parse(e.newValue) as TripPlan[])
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      localPlansListeners.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  }
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
  if (!database) {
    const all = readLs<TripPlan[]>(LS_PLANS, [])
    const id = `local-${Date.now()}`
    all.unshift({ ...payload, id })
    writeLs(LS_PLANS, all)
    notifyLocalPlans(all)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LS_PLANS,
        newValue: JSON.stringify(all),
      }),
    )
    return
  }
  await push(ref(database, `${tripPath}/plans`), payload)
}

export async function decidePlan(
  planId: string,
  status: 'agreed' | 'vetoed',
  decisionNote?: string,
): Promise<void> {
  const database = getDb()
  if (!database) {
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
    notifyLocalPlans(next)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LS_PLANS,
        newValue: JSON.stringify(next),
      }),
    )
    return
  }
  await update(ref(database, `${tripPath}/plans/${planId}`), {
    status,
    decidedAt: Date.now(),
    decisionNote: decisionNote ?? null,
  })
}

export async function withdrawPlan(planId: string): Promise<void> {
  const database = getDb()
  if (!database) {
    const all = readLs<TripPlan[]>(LS_PLANS, []).filter((p) => p.id !== planId)
    writeLs(LS_PLANS, all)
    notifyLocalPlans(all)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LS_PLANS,
        newValue: JSON.stringify(all),
      }),
    )
    return
  }
  await remove(ref(database, `${tripPath}/plans/${planId}`))
}

function readDrivePlansLs(): Record<string, DriveDayPlan> {
  return readLs<Record<string, DriveDayPlan>>(LS_DRIVE_PLANS, {})
}

function writeDrivePlansLs(all: Record<string, DriveDayPlan>) {
  writeLs(LS_DRIVE_PLANS, all)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: LS_DRIVE_PLANS,
      newValue: JSON.stringify(all),
    }),
  )
}

export function subscribeDrivePlan(
  dayId: string,
  cb: (plan: DriveDayPlan | null) => void,
): Unsub {
  const database = getDb()
  if (!database) {
    const all = readDrivePlansLs()
    cb(all[dayId] ?? null)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_DRIVE_PLANS && e.newValue) {
        const next = JSON.parse(e.newValue) as Record<string, DriveDayPlan>
        cb(next[dayId] ?? null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }
  return onValue(ref(database, `${tripPath}/drivePlans/${dayId}`), (snap) => {
    cb((snap.val() as DriveDayPlan | null) ?? null)
  })
}

export async function saveDrivePlan(plan: DriveDayPlan): Promise<void> {
  const next: DriveDayPlan = { ...plan, updatedAt: Date.now() }
  const database = getDb()
  if (!database) {
    const all = readDrivePlansLs()
    all[plan.dayId] = next
    writeDrivePlansLs(all)
    return
  }
  await set(ref(database, `${tripPath}/drivePlans/${plan.dayId}`), next)
}
