import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { IdentityLayout } from './components/IdentityLayout'
import { DriveDayPage } from './components/drive/DriveDayPage'
import { DriveDayPicker } from './components/drive/DriveDayPicker'
import { UserSetup } from './components/UserSetup'
import { HomePage } from './pages/HomePage'
import { isDirectorUnlocked } from './lib/director'
import { loadIdentity, saveIdentity } from './lib/identity'
import type { LocalIdentity } from './lib/types'

export default function App() {
  const [identity, setIdentity] = useState<LocalIdentity | null>(() => {
    const loaded = loadIdentity()
    if (!loaded) return null
    return { ...loaded, isDirector: loaded.isDirector && isDirectorUnlocked() }
  })

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
        <Route element={<IdentityLayout identity={identity} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/drive" element={<DriveDayPicker />} />
          <Route path="/drive/:dayId" element={<DriveDayPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
