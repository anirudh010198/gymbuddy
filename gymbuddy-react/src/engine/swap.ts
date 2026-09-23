import { BY_ID, EXERCISES } from './exercises'
import { TEMPLATES } from './templates'
import { today } from './dates'
import { isSupportedEquip } from './age'
import type { ActiveWorkout, Equip, Exercise, Group, Pattern, Reason, SessionLength, WorkoutItem } from './types'

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

/** The patterns that make up each muscle group. Each group has only 3 of
 *  these, so neither Quick (4 exercises) nor Full (6) can guarantee zero
 *  pattern repeats — buildGroupWorkout round-robins across patterns for
 *  best-effort variety instead, same idea for both, just a different count. */
export const GROUP_PATTERNS: Record<Group, Pattern[]> = {
  legs: ['squat', 'hinge', 'lunge'],
  push: ['hpush', 'vpush', 'arms'],
  pull: ['vpull', 'hpull', 'arms'],
}

export const QUICK_SESSION_SIZE = 4
export const FULL_SESSION_SIZE = 6

function sortForAge(pool: Exercise[], preferSupported: boolean): Exercise[] {
  if (!preferSupported) return pool
  // Stable sort: supported (machine/cable) options first, ties broken by
  // original library order — the free-weight option is still one Swap away.
  return [...pool].sort((a, b) => Number(isSupportedEquip(b.equip)) - Number(isSupportedEquip(a.equip)))
}

/** Interleaves exercises across their patterns (round-robin) so a "pick N"
 *  selection maximizes pattern variety before it's forced to repeat one. */
function roundRobinByPattern(pool: Exercise[]): Exercise[] {
  const byPattern = new Map<Pattern, Exercise[]>()
  for (const e of pool) {
    const list = byPattern.get(e.pattern) ?? []
    list.push(e)
    byPattern.set(e.pattern, list)
  }
  const buckets = [...byPattern.values()]
  const out: Exercise[] = []
  let i = 0
  while (out.length < pool.length) {
    for (const bucket of buckets) {
      if (i < bucket.length) out.push(bucket[i])
    }
    i++
  }
  return out
}

const GROUP_ORDER: Group[] = ['legs', 'push', 'pull']

/** "Remember the last choice and suggest the next logical one" — a fixed
 *  legs -> push -> pull -> legs rotation. Also what "Pick for me" applies
 *  automatically, without making the user read the day-select options. */
export function suggestNextGroup(lastGroup: Group | null | undefined): Group {
  if (!lastGroup) return 'legs'
  return GROUP_ORDER[(GROUP_ORDER.indexOf(lastGroup) + 1) % GROUP_ORDER.length]
}

export interface GroupWorkoutPick {
  pattern: Pattern
  id: string
  role: Exercise['role']
}

/**
 * Builds one day's exercise picks for a single chosen muscle group. Quick
 * picks 4, Full picks 6 — both the same way: mains first (round-robined
 * across patterns for best-effort variety), then accessories fill any
 * remaining slots, capped at the session size. Every group has enough
 * mains alone (5-6) to fill Quick's 4 slots, so a Quick session is always
 * 4 main-role exercises; Full is the one that reaches into accessories.
 */
export function buildGroupWorkout(group: Group, length: SessionLength, equip: Equip[], preferSupportedEquip = false): GroupWorkoutPick[] {
  const groupPool = sortForAge(
    availableExercises(equip).filter((e) => e.group === group),
    preferSupportedEquip,
  )
  const size = length === 'quick' ? QUICK_SESSION_SIZE : FULL_SESSION_SIZE
  const mains = roundRobinByPattern(groupPool.filter((e) => e.role === 'main'))
  const accessories = roundRobinByPattern(groupPool.filter((e) => e.role === 'accessory'))
  const picks = [...mains, ...accessories].slice(0, size)
  return picks.map((e) => ({ pattern: e.pattern, id: e.id, role: e.role }))
}

function reasonScore(e: Exercise, cur: Exercise, reason: Reason): number {
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

/**
 * Swap engine: deterministic, instant, works offline. The pool is every
 * available exercise in the current one's muscle group (not narrowed to its
 * pattern) — the "Change exercise" list is meant to show every option in
 * that group, always excluding exercises already tried on this item.
 * Reason changes the ranking within that pool. Returns the full ranked
 * pool, best first; `swapCandidate` (singular) just takes the top one for
 * callers that don't need the whole list.
 */
export function swapCandidates(item: WorkoutItem, reason: Reason, equip: Equip[]): Exercise[] {
  const cur = BY_ID[item.id]
  const tried = new Set([item.id, ...item.swaps.map((s) => s.from)])
  const pool = availableExercises(equip).filter((e) => e.group === cur.group && !tried.has(e.id))
  if (!pool.length) return []

  return pool
    .map((e, i) => ({ e, s: reasonScore(e, cur, reason) + i * 0.01 }))
    .sort((a, b) => a.s - b.s)
    .map((x) => x.e)
}

export function swapCandidate(item: WorkoutItem, reason: Reason, equip: Equip[]): Exercise | null {
  return swapCandidates(item, reason, equip)[0] ?? null
}
