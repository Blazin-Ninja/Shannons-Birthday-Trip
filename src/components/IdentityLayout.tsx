import { Outlet } from 'react-router-dom'
import type { LocalIdentity } from '../lib/types'
import { IdentityContext } from '../context/IdentityContext'

type Props = {
  identity: LocalIdentity
  logout: () => void
}

export function IdentityLayout({ identity, logout }: Props) {
  return (
    <IdentityContext.Provider value={{ identity, logout }}>
      <Outlet />
    </IdentityContext.Provider>
  )
}
