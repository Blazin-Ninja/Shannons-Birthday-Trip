import { createContext, useContext } from 'react'
import type { LocalIdentity } from '../lib/types'

type IdentityContextValue = {
  identity: LocalIdentity
  logout: () => void
}

export const IdentityContext = createContext<IdentityContextValue | null>(null)

export function useIdentity(): LocalIdentity {
  const ctx = useContext(IdentityContext)
  if (!ctx) {
    throw new Error('useIdentity must be used within IdentityContext')
  }
  return ctx.identity
}

export function useLogout(): () => void {
  const ctx = useContext(IdentityContext)
  if (!ctx) {
    throw new Error('useLogout must be used within IdentityContext')
  }
  return ctx.logout
}
