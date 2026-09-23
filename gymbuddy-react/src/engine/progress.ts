import { GOALS, repTargetsFor } from './goals'
import { BY_ID } from './exercises'
import type { Equip, Exercise, GoalKey, HistoryEntry, SetEntry } from './types'

export const DEFAULT_BODYWEIGHT_KG = 70

/** A reasonable starting weight for a genuinely first-time weighted
 *  exercise — never left blank, so the weight picker (and the volume it
 *  feeds) always has a real number to work from. Bodyweight exercises use
 *  the person's own estimated bodyweight instead (see resolveStartWeight). */
function defaultStartWeight(equip: Equip): number {
  if (equip === 'dumbbell') return 8
  if (equip === 'cable') return 15
  return 20 // machine, barbell
}

/** The weight a brand-new set of this exercise should start at: last time's
 *  weight if there is one, else a sensible default for the equipment type —
 *  or, for a bodyweight exercise, the person's own estimated bodyweight
 *  (profile-level, defaulting to 70kg) so "bodyweight" sets still count
 *  toward total volume instead of silently contributing 0. */
export function resolveStartWeight(exerciseId: string, prevWeight: number | null | undefined, bodyweightKg: number | null | undefined): number {
  if (prevWeight != null) return prevWeight
  const ex = BY_ID[exerciseId]
  if (ex?.equip === 'bodyweight') return bodyweightKg ?? DEFAULT_BODYWEIGHT_KG
  return defaultStartWeight(ex?.equip ?? 'machine')
}

/** A pending/logged set during an active workout — always has a concrete
 *  `reps` default (unlike the persisted `SetEntry`, which allows null for
 *  legacy data). Structurally assignable into `SetEntry` at finish time. */
export interface SetState {
  reps: number
  weight: number | null
  completedAt: number | null
}

export function goalTargetReps(goal: GoalKey): number {
  return parseInt(GOALS[goal].reps, 10) || 10
}

/** Most recent history log for this exercise id, or null if never logged before. */
export function findLastLog(history: HistoryEntry[], exerciseId: string): SetEntry[] | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i].items.find((it) => it.id === exerciseId)
    if (item && Array.isArray(item.log) && item.log.some((s) => s.completedAt != null)) return item.log
  }
  return null
}

/** Pre-fills each set from last time's reps/weight (repeating the last known
 *  set if there were fewer sets last time), or this set's own per-set target
 *  rep count (heavier/lower-rep as the set number climbs) with a blank
 *  weight on a true first time. */
export function defaultSetsFor(
  exerciseId: string,
  goal: GoalKey,
  history: HistoryEntry[],
  setsCount: number,
  bodyweightKg?: number | null,
): SetState[] {
  const last = findLastLog(history, exerciseId)
  const targets = repTargetsFor(goal, setsCount)
  return Array.from({ length: setsCount }, (_, i) => {
    const prev = last ? (last[i] ?? last[last.length - 1]) : null
    return {
      reps: prev?.reps ?? targets[i] ?? targets[targets.length - 1],
      weight: resolveStartWeight(exerciseId, prev?.weight, bodyweightKg),
      completedAt: null,
    }
  })
}

/** Same pre-fill rule as `defaultSetsFor` (inherit last time's reps/weight,
 *  repeating the last known set if there were fewer sets last time), but for
 *  a "Build my own" pick where the user chose one target-reps number
 *  themselves rather than a goal-driven per-set target curve. */
export function customSetsFor(
  exerciseId: string,
  history: HistoryEntry[],
  setsCount: number,
  targetReps: number,
  bodyweightKg?: number | null,
): SetState[] {
  const last = findLastLog(history, exerciseId)
  return Array.from({ length: setsCount }, (_, i) => {
    const prev = last ? (last[i] ?? last[last.length - 1]) : null
    return { reps: prev?.reps ?? targetReps, weight: resolveStartWeight(exerciseId, prev?.weight, bodyweightKg), completedAt: null }
  })
}

/** 2.5 kg steps, except 1 kg steps for dumbbells under 10 kg (small enough
 *  that 2.5 kg jumps are too coarse for a beginner). */
export function weightStep(exercise: Exercise, currentWeight: number | null): number {
  if (exercise.equip === 'dumbbell' && (currentWeight == null || currentWeight < 10)) return 1
  return 2.5
}

export function totalReps(log: SetEntry[]): number {
  return log.filter((s) => s.completedAt != null).reduce((a, s) => a + (s.reps ?? 0), 0)
}

export function totalVolume(log: SetEntry[]): number {
  return log.filter((s) => s.completedAt != null).reduce((a, s) => a + (s.reps ?? 0) * (s.weight ?? 0), 0)
}

function maxWeight(log: SetEntry[]): number | null {
  const weights = log.filter((s) => s.completedAt != null && s.weight != null).map((s) => s.weight as number)
  return weights.length ? Math.max(...weights) : null
}

export function formatLastTime(log: SetEntry[]): string {
  const completed = log.filter((s) => s.completedAt != null)
  if (!completed.length) return ''
  const reps = completed.map((s) => s.reps ?? '–').join(', ')
  const weight = completed.find((s) => s.weight != null)?.weight
  return weight != null ? `${reps} reps @ ${weight} kg` : `${reps} reps`
}

export interface Comparison {
  arrow: 'up' | 'down' | 'same'
  label: string
}

/** Neutral grey ▲/▼/=, never red — a lighter day is normal, not a failure. */
export function compareToLast(current: SetEntry[], last: SetEntry[] | null): Comparison {
  if (!last) return { arrow: 'same', label: 'First time' }
  const curReps = totalReps(current)
  const lastReps = totalReps(last)
  if (curReps !== lastReps) {
    const d = curReps - lastReps
    return { arrow: d > 0 ? 'up' : 'down', label: `${d > 0 ? '+' : ''}${d} reps` }
  }
  const curW = maxWeight(current)
  const lastW = maxWeight(last)
  if (curW != null && lastW != null && curW !== lastW) {
    const d = curW - lastW
    return { arrow: d > 0 ? 'up' : 'down', label: `${d > 0 ? '+' : ''}${d} kg` }
  }
  return { arrow: 'same', label: 'Same as last time' }
}

/** A set is a PB if it beats the best-ever reps at that exact weight, or is
 *  a new top weight, judged only against `priorHistory` — history strictly
 *  BEFORE the workout currently being logged, never itself. */
export function isPB(priorHistory: HistoryEntry[], exerciseId: string, set: SetEntry): boolean {
  if (set.completedAt == null || set.reps == null) return false
  let bestWeight: number | null = null
  let bestRepsAtThisWeight = 0
  for (const h of priorHistory) {
    const item = h.items.find((it) => it.id === exerciseId)
    if (!item || !Array.isArray(item.log)) continue
    for (const s of item.log) {
      if (s.completedAt == null) continue
      if (s.weight != null && (bestWeight == null || s.weight > bestWeight)) bestWeight = s.weight
      if (set.weight != null && s.weight === set.weight && (s.reps ?? 0) > bestRepsAtThisWeight) bestRepsAtThisWeight = s.reps ?? 0
    }
  }
  const newTopWeight = set.weight != null && (bestWeight == null || set.weight > bestWeight)
  const newRepsAtWeight = set.weight != null && set.reps > bestRepsAtThisWeight
  return newTopWeight || newRepsAtWeight
}

export function exerciseHasPB(priorHistory: HistoryEntry[], exerciseId: string, log: SetEntry[]): boolean {
  return log.some((s) => isPB(priorHistory, exerciseId, s))
}
