import { useState } from 'react'
import { createGymStore, createMemoryStorage } from '../store/useGymStore'
import { GymStoreProvider } from '../store/GymStoreContext'
import { BusySourceProvider } from '../store/BusySourceContext'
import { createMemoryBusySource } from '../engine/busyMap'
import { buildDemoSeed } from '../lib/demoSeed'
import AppRoot from '../app/AppRoot'

/** "See a 3-week-old account" — a full run of the real /app UI, backed by a
 *  store that's in-memory only (never localStorage, never Supabase — see
 *  createMemoryStorage and AppRoot's demo prop, which also disables
 *  SyncBridge here) and pre-seeded with 3 weeks of realistic fake history.
 *  Never the real visitor's data, in either direction. */
export default function Demo() {
  // useState's lazy initializer, not useMemo — a real per-mount guarantee
  // (matching the app's other from-scratch-every-mount stores), so this
  // never resumes a stale demo session.
  const [demoBusySource] = useState(() => {
    const seed = buildDemoSeed()
    return { source: createMemoryBusySource(seed.busyReports), seed }
  })
  const [demoStore] = useState(() => {
    const store = createGymStore('gymbuddy.demo', createMemoryStorage(), demoBusySource.source)
    const seed = demoBusySource.seed
    store.setState({
      profile: seed.profile,
      history: seed.history,
      active: seed.active,
      lastDone: null,
      showSummary: false,
      postOnboardingAuthPending: false,
      peekHome: false,
    })
    return store
  })

  return (
    <GymStoreProvider store={demoStore}>
      <BusySourceProvider source={demoBusySource.source}>
        <AppRoot demo />
      </BusySourceProvider>
    </GymStoreProvider>
  )
}
