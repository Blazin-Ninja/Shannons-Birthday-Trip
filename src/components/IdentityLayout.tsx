import { Outlet } from 'react-router-dom'
import type { LocalIdentity } from '../lib/types'
import { IdentityContext } from '../context/IdentityContext'

type Props = {
  identity: LocalIdentity
}

export function IdentityLayout({ identity }: Props) {
  return (
    <IdentityContext.Provider value={identity}>
      <Outlet />
    </IdentityContext.Provider>
  )
}
