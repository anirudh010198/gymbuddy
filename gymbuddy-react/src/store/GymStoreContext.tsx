import { createContext, useContext } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import { useGymStore as defaultGymStore, type GymState } from './useGymStore'

type BoundGymStore = UseBoundStore<StoreApi<GymState>>

/** The one real "gymbuddy.v1" store, used by every /app screen. */
const GymStoreContext = createContext<BoundGymStore>(defaultGymStore)

export function useGym<T>(selector: (state: GymState) => T): T {
  const store = useContext(GymStoreContext)
  return store(selector)
}
