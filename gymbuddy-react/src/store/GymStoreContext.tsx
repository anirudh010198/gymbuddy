import { createContext, useContext, type ReactNode } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import { useGymStore as defaultGymStore, type GymState } from './useGymStore'

type BoundGymStore = UseBoundStore<StoreApi<GymState>>

/** Defaults to the real "gymbuddy.v1" store, so every /app screen works
 *  unchanged. The landing page's phone-frame demo overrides this with an
 *  isolated store (key "gymbuddy.demo") via GymStoreProvider, so the demo
 *  can never read or write a visitor's real progress. */
const GymStoreContext = createContext<BoundGymStore>(defaultGymStore)

export function GymStoreProvider({ store, children }: { store: BoundGymStore; children: ReactNode }) {
  return <GymStoreContext.Provider value={store}>{children}</GymStoreContext.Provider>
}

export function useGym<T>(selector: (state: GymState) => T): T {
  const store = useContext(GymStoreContext)
  return store(selector)
}
