import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { BY_ID } from '../engine/exercises'
import { SETS } from '../engine/goals'
import { today } from '../engine/dates'
import { buildWorkout, swapCandidate } from '../engine/swap'
import { appendEvent } from '../engine/track'
import type { Equip, Exercise, GoalKey, HistoryEntry, Pattern, Profile, Reason, Swap, TrackEvent } from '../engine/types'

export interface ActiveItem {
  pattern: Pattern
  id: string
  swaps: Swap[]
  done: boolean[]
}

export interface Active {
  date: string
  dayIndex: number
  items: ActiveItem[]
  startedAt: number
  finished?: boolean
}

export type SwapOutcome = { ok: true; exercise: Exercise; reason: Reason } | { ok: false }

export interface GymState {
  profile: Profile | null
  history: HistoryEntry[]
  active: Active | null
  events: TrackEvent[]
  lastDone: string | null
  showSummary: boolean
  /** True while the user has tapped "Home" mid-workout to peek at the Home
   *  screen without abandoning today's in-progress workout. */
  peekHome: boolean

  completeOnboarding: (goal: GoalKey, equip: Equip[], target: number) => void
  changeGoal: () => void
  setPeekHome: (v: boolean) => void
  startWorkout: () => void
  toggleSet: (itemIndex: number, setIndex: number) => void
  requestSwap: (itemIndex: number, reason: Reason) => SwapOutcome
  finishWorkout: () => void
  setFeel: (feel: string) => void
  dismissSummary: () => void
  trackEvent: (type: string, data?: Record<string, unknown>) => void
}

/** Adapts the pre-migration vanilla-version flat shape {profile,history,active,events} into
 *  zustand persist's {state,version} envelope, so the same "gymbuddy.v1" key keeps working. */
function migrateRaw(raw: unknown): StorageValue<Partial<GymState>> | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if ('state' in obj) return obj as StorageValue<Partial<GymState>>
  return {
    state: {
      profile: (obj.profile as Profile) ?? null,
      history: (obj.history as HistoryEntry[]) ?? [],
      active: sanitizeActive(obj.active),
      events: (obj.events as TrackEvent[]) ?? [],
      lastDone: (obj.lastDone as string) ?? null,
      showSummary: (obj.showSummary as boolean) ?? false,
    },
    version: 1,
  }
}

/** Old active.items used {slot, done: boolean[]}; new engine items use {pattern}.
 *  Drops the active workout (forcing a fresh one) if it references an exercise id
 *  that no longer exists, rather than crashing on lookup. */
function sanitizeActive(raw: unknown): Active | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>
  if (!Array.isArray(a.items)) return null
  const items: ActiveItem[] = (a.items as Record<string, unknown>[]).map((it) => ({
    pattern: (it.pattern as Pattern) ?? (it.slot as Pattern),
    id: it.id as string,
    swaps: Array.isArray(it.swaps) ? (it.swaps as Swap[]) : [],
    done: Array.isArray(it.done) ? (it.done as unknown[]).map((d) => d === true) : Array(SETS).fill(false),
  }))
  if (items.some((it) => !it.pattern || !BY_ID[it.id])) return null
  return {
    date: (a.date as string) ?? today(),
    dayIndex: (a.dayIndex as number) ?? 0,
    items,
    startedAt: (a.startedAt as number) ?? Date.now(),
    finished: a.finished as boolean | undefined,
  }
}

function createStorage(key: string): PersistStorage<Partial<GymState>> {
  return {
    getItem: () => {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        return migrateRaw(JSON.parse(raw))
      } catch {
        return null
      }
    },
    setItem: (_key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* storage unavailable (private mode, quota) — app still works, just doesn't persist */
      }
    },
    removeItem: () => {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    },
  }
}

/** Factory so the landing-page demo can mount an isolated instance under
 *  "gymbuddy.demo" without ever touching the visitor's real progress. */
export function createGymStore(storageKey: string): UseBoundStore<StoreApi<GymState>> {
  return create<GymState>()(
    persist(
      (set, get) => ({
        profile: null,
        history: [],
        active: null,
        events: [],
        lastDone: null,
        showSummary: false,
        peekHome: false,

        setPeekHome: (v) => set({ peekHome: v }),

        trackEvent: (type, data) => set((s) => ({ events: appendEvent(s.events, type, data) })),

        completeOnboarding: (goal, equip, target) => {
          const profile: Profile = { goal, equip, target, created: today() }
          set({ profile })
          get().trackEvent('onboard_done', { equip, target })
          get().startWorkout()
        },

        changeGoal: () => set({ profile: null, active: null }),

        startWorkout: () => {
          const profile = get().profile
          if (!profile) return
          set({ peekHome: false })
          const existing = get().active
          if (existing && existing.date === today() && !existing.finished) return
          const dayIndex = get().history.length
          const built = buildWorkout(dayIndex, profile.equip)
          const active: Active = {
            ...built,
            items: built.items.map((it) => ({ ...it, done: Array(SETS).fill(false) })),
          }
          set({ active })
          get().trackEvent('workout_generated', { dayIndex })
        },

        toggleSet: (itemIndex, setIndex) => {
          const active = get().active
          if (!active) return
          const items = active.items.map((it, i) => {
            if (i !== itemIndex) return it
            const done = [...it.done]
            done[setIndex] = !done[setIndex]
            return { ...it, done }
          })
          set({ active: { ...active, items } })
          if (items[itemIndex].done[setIndex]) {
            get().trackEvent('set_logged', { ex: items[itemIndex].id })
            if (navigator.vibrate) navigator.vibrate(15)
          }
        },

        requestSwap: (itemIndex, reason) => {
          const active = get().active
          const profile = get().profile
          if (!active || !profile) return { ok: false }
          const item = active.items[itemIndex]
          get().trackEvent('swap_opened', { ex: item.id })
          const next = swapCandidate(item, reason, profile.equip)
          if (!next) {
            get().trackEvent('swap_exhausted', { ex: item.id })
            return { ok: false }
          }
          const items = active.items.map((it, i) =>
            i === itemIndex
              ? { ...it, id: next.id, done: Array(SETS).fill(false), swaps: [...it.swaps, { from: it.id, to: next.id, reason }] }
              : it,
          )
          set({ active: { ...active, items } })
          get().trackEvent('swap_done', { reason, to: next.id })
          return { ok: true, exercise: next, reason }
        },

        finishWorkout: () => {
          const active = get().active
          if (!active) return
          const sets = active.items.reduce((a, i) => a + i.done.filter(Boolean).length, 0)
          const entry: HistoryEntry = {
            date: today(),
            dayIndex: active.dayIndex,
            sets,
            items: active.items.map((i) => ({ id: i.id, sets: i.done.filter(Boolean).length, swaps: i.swaps })),
            mins: Math.round((Date.now() - active.startedAt) / 60000),
          }
          set((s) => ({
            history: [...s.history, entry],
            active: { ...active, finished: true },
            lastDone: today(),
            showSummary: true,
          }))
          get().trackEvent('workout_done', { sets, swaps: active.items.reduce((a, i) => a + i.swaps.length, 0) })
        },

        setFeel: (feel) => {
          set((s) => {
            if (!s.history.length) return s
            const history = [...s.history]
            history[history.length - 1] = { ...history[history.length - 1], feel }
            return { history }
          })
          get().trackEvent('feel', { feel })
        },

        dismissSummary: () => set({ showSummary: false }),
      }),
      {
        name: storageKey,
        storage: createStorage(storageKey),
        version: 1,
        // peekHome is transient UI state (mid-workout "Home" peek) — never persisted,
        // so it can't get stuck true across a reload while a workout is still active.
        partialize: (state) => ({
          profile: state.profile,
          history: state.history,
          active: state.active,
          events: state.events,
          lastDone: state.lastDone,
          showSummary: state.showSummary,
        }),
      },
    ),
  )
}

export const useGymStore = createGymStore('gymbuddy.v1')
