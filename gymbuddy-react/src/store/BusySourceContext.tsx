import { createContext, useContext, type ReactNode } from 'react'
import { localBusySource, type BusySource } from '../engine/busyMap'

/** Same shape as GymStoreContext: defaults to the real localStorage-backed
 *  source, /demo overrides it with an in-memory one so simulated "it's
 *  busy" swaps never touch a real visitor's gymbuddy.busy data. */
const BusySourceContext = createContext<BusySource>(localBusySource)

export function BusySourceProvider({ source, children }: { source: BusySource; children: ReactNode }) {
  return <BusySourceContext.Provider value={source}>{children}</BusySourceContext.Provider>
}

export function useBusySource(): BusySource {
  return useContext(BusySourceContext)
}
