import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { IdentityLayout } from './components/IdentityLayout'
import { DriveDayPage } from './components/drive/DriveDayPage'
import { DriveDayPicker } from './components/drive/DriveDayPicker'
import { UserSetup } from './components/UserSetup'
import { MapHomePage } from './pages/MapHomePage'
import { publishUser } from './lib/firebase'
import { isDirectorUnlocked, lockDirector } from './lib/director'
import { clearIdentity, loadIdentity, saveIdentity } from './lib/identity'
import type { LocalIdentity } from './lib/types'

export default function App() {
  const [identity, setIdentity] = useState<LocalIdentity | null>(() => {
    const loaded = loadIdentity()
    if (!loaded) return null
    return { ...loaded, isDirector: loaded.isDirector && isDirectorUnlocked() }
  })

  function handleLogout() {
    const current = identity
    if (current) {
      void publishUser(current.travelerId, {
        name: current.name,
        color: current.color,
        avatar: current.avatar,
        travelerId: current.travelerId,
        lat: 0,
        lng: 0,
        updatedAt: Date.now(),
        sharing: false,
      })
    }
    clearIdentity()
    lockDirector()
    setIdentity(null)
  }

  if (!identity) {
    return (
      <UserSetup
        onComplete={(partial) => {
          const next = saveIdentity(partial)
          setIdentity(next)
        }}
      />
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          element={<IdentityLayout identity={identity} logout={handleLogout} />}
        >
          <Route path="/" element={<MapHomePage />} />
          <Route path="/drive" element={<DriveDayPicker />} />
          <Route path="/drive/:dayId" element={<DriveDayPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
