import { BY_ID, EXERCISES } from './exercises'
import { TEMPLATES } from './templates'
import { today } from './dates'
import type { ActiveWorkout, Equip, Exercise, Pattern, Reason, WorkoutItem } from './types'

/** Exercises usable with the given equipment. Bodyweight is always available. */
export function availableExercises(equip: Equip[]): Exercise[] {
  const set = new Set<Equip>([...equip, 'bodyweight'])
  return EXERCISES.filter((e) => set.has(e.equip))
}

/**
 * Picks the best exercise for a pattern: prefer `role: "main"`, in library
 * order (which lists the best-equipped option first per pattern), falling
 * back to any available exercise for that pattern, and finally to the
 * canonical bodyweight exercise for that pattern (always available).
 */
export function pickForPattern(pattern: Pattern, equip: Equip[], exclude: string[] = []): Exercise {
  const pool = availableExercises(equip).filter((e) => e.pattern === pattern && !exclude.includes(e.id))
  const mains = pool.filter((e) => e.role === 'main')
  if (mains.length) return mains[0]
  if (pool.length) return pool[0]
  const fallback = EXERCISES.find((e) => e.pattern === pattern && e.equip === 'bodyweight')
  if (fallback) return fallback
  throw new Error(`No exercise available for pattern "${pattern}"`)
}

export function buildWorkout(dayIndex: number, equip: Equip[]): ActiveWorkout {
  const tpl = TEMPLATES[dayIndex % 2]
  const items: WorkoutItem[] = tpl.map((pattern) => ({
    pattern,
    id: pickForPattern(pattern, equip).id,
    swaps: [],
  }))
  return { date: today(), dayIndex, items, startedAt: Date.now() }
}

/**
 * Swap engine: deterministic, instant, works offline. Pool tiers narrow from
 * same pattern → same group → group's bodyweight fallback, always excluding
 * exercises already tried on this item. Reason changes the ranking within
 * whichever tier has candidates.
 */
export function swapCandidate(item: WorkoutItem, reason: Reason, equip: Equip[]): Exercise | null {
  const cur = BY_ID[item.id]
  const tried = new Set([item.id, ...item.swaps.map((s) => s.from)])
  const avail = availableExercises(equip)

  const tiers = [
    avail.filter((e) => e.pattern === cur.pattern && !tried.has(e.id)),
    avail.filter((e) => e.group === cur.group && !tried.has(e.id)),
    avail.filter((e) => e.group === cur.group && e.equip === 'bodyweight' && !tried.has(e.id)),
  ]
  const pool = tiers.find((t) => t.length) ?? []
  if (!pool.length) return null

  const score = (e: Exercise) => {
    let s = 0
    if (reason === 'busy') {
      if (e.equip !== cur.equip) s -= 10
      if (e.equip === 'bodyweight' || e.equip === 'dumbbell') s -= 3
    }
    if (reason === 'unsure') {
      s += e.level * 10
      if (e.equip === 'machine') s -= 4
    }
    if (reason === 'pain') {
      s += e.level * 10
      if (e.equip === 'bodyweight') s -= 6
    }
    return s
  }

  return pool.map((e, i) => ({ e, s: score(e) + i * 0.01 })).sort((a, b) => a.s - b.s)[0].e
}
