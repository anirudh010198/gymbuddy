import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { BY_ID } from '../engine/exercises'
import { SETS } from '../engine/goals'
import { today } from '../engine/dates'
import { buildWorkout, swapCandidate } from '../engine/swap'
import { appendEvent } from '../engine/track'
import { defaultSetsFor, goalTargetReps, totalReps, totalVolume, type SetState } from '../engine/progress'
import type { Equip, Exercise, GoalKey, HistoryEntry, Pattern, Profile, Reason, Swap, TrackEvent } from '../engine/types'

export type { SetState }

export interface ActiveItem {
  pattern: Pattern
  id: string
  swaps: Swap[]
  sets: SetState[]
  /** Build-muscle only: whether the "bonus tip unlocked" card has fired for this item. */
  tipShown: boolean
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
  logSet: (itemIndex: number, setIndex: number) => void
  setSetValues: (itemIndex: number, setIndex: number, patch: { reps?: number; weight?: number | null }) => void
  requestSwap: (itemIndex: number, reason: Reason) => SwapOutcome
  finishWorkout: () => void
  setFeel: (feel: string) => void
  dismissSummary: () => void
  trackEvent: (type: string, data?: Record<string, unknown>) => void
}

function freshItems(built: { pattern: Pattern; id: string; swaps: Swap[] }[], goal: GoalKey, history: HistoryEntry[]): ActiveItem[] {
  return built.map((it) => ({ ...it, sets: defaultSetsFor(it.id, goal, history, SETS), tipShown: false }))
}

/** Adapts the pre-migration vanilla-version flat shape {profile,history,active,events} into
 *  zustand persist's {state,version} envelope, so the same "gymbuddy.v1" key keeps working. */
function migrateRaw(raw: unknown): StorageValue<Partial<GymState>> | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  // Always sanitize the inner data, whether it arrives as the pre-migration flat
  // vanilla shape or already wrapped in zustand's own {state,version} envelope from
  // an earlier version of this store (e.g. step 3's `done: boolean[]` sets) — the
  // envelope wrapper alone doesn't mean the fields inside it are current-shape.
  const data = ('state' in obj ? obj.state : obj) as Record<string, unknown>
  const profile = (data.profile as Profile) ?? null
  return {
    state: {
      profile,
      history: sanitizeHistory(data.history),
      active: sanitizeActive(data.active, profile?.goal),
      events: (data.events as TrackEvent[]) ?? [],
      lastDone: (data.lastDone as string) ?? null,
      showSummary: (data.showSummary as boolean) ?? false,
    },
    version: 1,
  }
}

/** Old active.items used {slot, done: boolean[]}; the step-3 shape used {pattern, done};
 *  the current shape uses {pattern, sets}. Converts either legacy shape forward, and
 *  drops the active workout (forcing a fresh one) if it references an exercise id that
 *  no longer exists, rather than crashing on lookup. */
function sanitizeActive(raw: unknown, goal: GoalKey | undefined): Active | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>
  if (!Array.isArray(a.items)) return null
  const target = goalTargetReps(goal ?? 'fit')
  const items: ActiveItem[] = (a.items as Record<string, unknown>[]).map((it) => {
    let sets: SetState[]
    if (Array.isArray(it.sets)) {
      sets = (it.sets as Record<string, unknown>[]).map((s) => ({
        reps: (s.reps as number) ?? target,
        weight: (s.weight as number) ?? null,
        completedAt: (s.completedAt as number) ?? null,
      }))
    } else if (Array.isArray(it.done)) {
      sets = (it.done as unknown[]).map((d) => ({ reps: target, weight: null, completedAt: d === true ? Date.now() : null }))
    } else {
      sets = Array.from({ length: SETS }, () => ({ reps: target, weight: null, completedAt: null }))
    }
    return {
      pattern: (it.pattern as Pattern) ?? (it.slot as Pattern),
      id: it.id as string,
      swaps: Array.isArray(it.swaps) ? (it.swaps as Swap[]) : [],
      sets,
      tipShown: (it.tipShown as boolean) ?? false,
    }
  })
  if (items.some((it) => !it.pattern || !BY_ID[it.id])) return null
  return {
    date: (a.date as string) ?? today(),
    dayIndex: (a.dayIndex as number) ?? 0,
    items,
    startedAt: (a.startedAt as number) ?? Date.now(),
    finished: a.finished as boolean | undefined,
  }
}

/** Old history items used {id, sets: number, swaps} (a count, not a log). Synthesizes a
 *  minimal log (reps/weight unknown -> null) so `findLastLog`/breakdown code never crashes
 *  on missing `.log`, at the cost of those old workouts showing as "first time" going forward. */
function sanitizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[]).map((h) => {
    const items = Array.isArray(h.items)
      ? (h.items as Record<string, unknown>[]).map((it) => {
          if (Array.isArray(it.log)) return it as unknown as HistoryEntry['items'][number]
          const count = typeof it.sets === 'number' ? it.sets : 0
          const completedAt = Date.parse(h.date as string) || Date.now()
          return {
            id: it.id as string,
            log: Array.from({ length: count }, () => ({ reps: null, weight: null, completedAt })),
            swaps: Array.isArray(it.swaps) ? (it.swaps as Swap[]) : [],
          }
        })
      : []
    return {
      date: h.date as string,
      dayIndex: (h.dayIndex as number) ?? 0,
      sets: (h.sets as number) ?? items.reduce((a, it) => a + it.log.filter((s) => s.completedAt != null).length, 0),
      reps: (h.reps as number) ?? items.reduce((a, it) => a + totalReps(it.log), 0),
      volume: (h.volume as number) ?? items.reduce((a, it) => a + totalVolume(it.log), 0),
      items,
      mins: (h.mins as number) ?? 0,
      feel: h.feel as string | undefined,
      tipsUnlocked: Array.isArray(h.tipsUnlocked) ? (h.tipsUnlocked as string[]) : undefined,
    }
  })
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
            items: freshItems(built.items, profile.goal, get().history),
          }
          set({ active })
          get().trackEvent('workout_generated', { dayIndex })
        },

        logSet: (itemIndex, setIndex) => {
          const active = get().active
          const profile = get().profile
          if (!active || !profile) return
          let justCompleted = false
          let unlockedTip = false
          const items = active.items.map((it, i) => {
            if (i !== itemIndex) return it
            const sets = it.sets.map((s, si) => {
              if (si !== setIndex) return s
              const completedAt = s.completedAt == null ? Date.now() : null
              if (completedAt != null) justCompleted = true
              return { ...s, completedAt }
            })
            const allDone = sets.every((s) => s.completedAt != null)
            const shouldUnlockTip = allDone && profile.goal === 'muscle' && !it.tipShown
            if (shouldUnlockTip) unlockedTip = true
            return { ...it, sets, tipShown: it.tipShown || shouldUnlockTip }
          })
          set({ active: { ...active, items } })
          if (justCompleted) {
            get().trackEvent('set_logged', { ex: items[itemIndex].id })
            if (navigator.vibrate) navigator.vibrate(15)
          }
          if (unlockedTip) get().trackEvent('tip_unlocked', { ex: items[itemIndex].id })
        },

        setSetValues: (itemIndex, setIndex, patch) => {
          const active = get().active
          if (!active) return
          const items = active.items.map((it, i) => {
            if (i !== itemIndex) return it
            const sets = it.sets.map((s, si) => (si === setIndex ? { ...s, ...patch } : s))
            return { ...it, sets }
          })
          set({ active: { ...active, items } })
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
              ? {
                  ...it,
                  id: next.id,
                  sets: defaultSetsFor(next.id, profile.goal, get().history, SETS),
                  tipShown: false,
                  swaps: [...it.swaps, { from: it.id, to: next.id, reason }],
                }
              : it,
          )
          set({ active: { ...active, items } })
          get().trackEvent('swap_done', { reason, to: next.id })
          return { ok: true, exercise: next, reason }
        },

        finishWorkout: () => {
          const active = get().active
          if (!active) return
          const items = active.items.map((i) => ({ id: i.id, log: i.sets, swaps: i.swaps }))
          const sets = items.reduce((a, it) => a + it.log.filter((s) => s.completedAt != null).length, 0)
          const reps = items.reduce((a, it) => a + totalReps(it.log), 0)
          const volume = items.reduce((a, it) => a + totalVolume(it.log), 0)
          const tipsUnlocked = active.items.filter((it) => it.tipShown).map((it) => BY_ID[it.id].bonusTip)
          const entry: HistoryEntry = {
            date: today(),
            dayIndex: active.dayIndex,
            sets,
            reps,
            volume,
            items,
            mins: Math.round((Date.now() - active.startedAt) / 60000),
            tipsUnlocked: tipsUnlocked.length ? tipsUnlocked : undefined,
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
