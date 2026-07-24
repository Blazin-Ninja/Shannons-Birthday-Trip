import { createContext, useContext } from 'react'
import type { LocalIdentity } from '../lib/types'

export const IdentityContext = createContext<LocalIdentity | null>(null)

export function useIdentity(): LocalIdentity {
  const identity = useContext(IdentityContext)
  if (!identity) {
    throw new Error('useIdentity must be used within IdentityContext')
  }
  return identity
}
