import type { LiveUser, TripPlan, TripStatus } from './types'
import { defaultStatus } from './defaults'

const BASE = 'https://mantledb.sh/v2'
const POLL_MS = 4000

/** Shared family trip channel — works without Firebase. */
export const mantleNamespace =
  import.meta.env.VITE_MANTLE_NS || 'sbt-shannon-2026-9e1d1eebeefa'

export function mantleEnabled(): boolean {
  return Boolean(mantleNamespace)
}

function url(path: string) {
  return `${BASE}/${mantleNamespace}/${path}`
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url(path), { cache: 'no-store' })
    if (res.status === 404) return fallback
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

async function putJson(path: string, body: unknown): Promise<void> {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Mantle write failed (${res.status})`)
  }
}

type Unsub = () => void

function poll<T>(
  load: () => Promise<T>,
  cb: (value: T) => void,
  serialize: (value: T) => string,
): Unsub {
  let stopped = false
  let last = ''

  async function tick() {
    if (stopped) return
    const value = await load()
    const next = serialize(value)
    if (next !== last) {
      last = next
      cb(value)
    }
  }

  void tick()
  const id = window.setInterval(() => void tick(), POLL_MS)
  return () => {
    stopped = true
    window.clearInterval(id)
  }
}

export function subscribeStatus(cb: (s: TripStatus) => void): Unsub {
  return poll(
    () => getJson<TripStatus>('status', defaultStatus),
    cb,
    (v) => JSON.stringify(v),
  )
}

export async function saveStatus(status: TripStatus): Promise<void> {
  await putJson('status', status)
}

export function subscribeUsers(
  cb: (users: Record<string, LiveUser>) => void,
): Unsub {
  return poll(
    () => getJson<Record<string, LiveUser>>('users', {}),
    cb,
    (v) => JSON.stringify(v),
  )
}

export async function publishUser(
  userId: string,
  user: LiveUser,
): Promise<void> {
  const all = await getJson<Record<string, LiveUser>>('users', {})
  all[userId] = user
  await putJson('users', all)
}

export function subscribePlans(cb: (plans: TripPlan[]) => void): Unsub {
  return poll(
    async () => {
      const val = await getJson<Record<string, Omit<TripPlan, 'id'>> | null>(
        'plans',
        null,
      )
      if (!val) return []
      const list = Object.entries(val).map(([id, p]) => ({ ...p, id }))
      list.sort((a, b) => b.createdAt - a.createdAt)
      return list
    },
    cb,
    (v) => JSON.stringify(v),
  )
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
  const all = await getJson<Record<string, Omit<TripPlan, 'id'>>>('plans', {})
  const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  all[id] = payload
  await putJson('plans', all)
}

export async function decidePlan(
  planId: string,
  status: 'agreed' | 'vetoed',
  decisionNote?: string,
): Promise<void> {
  const all = await getJson<Record<string, Omit<TripPlan, 'id'>>>('plans', {})
  const existing = all[planId]
  if (!existing) return
  all[planId] = {
    ...existing,
    status,
    decidedAt: Date.now(),
    decisionNote,
  }
  await putJson('plans', all)
}

export async function withdrawPlan(planId: string): Promise<void> {
  const all = await getJson<Record<string, Omit<TripPlan, 'id'>>>('plans', {})
  delete all[planId]
  await putJson('plans', all)
}
