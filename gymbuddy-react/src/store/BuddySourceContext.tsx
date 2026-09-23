import { createContext, useContext, type ReactNode } from 'react'
import { localBuddySource, type BuddySource } from '../engine/buddy'

/** Same shape as BusySourceContext: defaults to the real localStorage-backed
 *  source, /demo overrides it with an in-memory one so a seeded sample
 *  buddy never touches a real visitor's gymbuddy.buddy data. */
const BuddySourceContext = createContext<BuddySource>(localBuddySource)

export function BuddySourceProvider({ source, children }: { source: BuddySource; children: ReactNode }) {
  return <BuddySourceContext.Provider value={source}>{children}</BuddySourceContext.Provider>
}

export function useBuddySource(): BuddySource {
  return useContext(BuddySourceContext)
}
