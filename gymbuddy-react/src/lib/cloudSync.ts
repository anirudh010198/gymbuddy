import { supabase } from './supabaseClient'
import type { EffortLabel, HistoryEntry, HistoryItemEntry, Profile } from '../engine/types'

/** Row shapes match supabase/schema.sql exactly. `exercises` deliberately
 *  drops swaps and bonus-tip unlocks — this syncs progress (what you did,
 *  how it felt), not a full local activity log. */
interface CloudSetEntry {
  reps: number | null
  weight: number | null
  completedAt: number | null
}
interface CloudExerciseEntry {
  id: string
  effort?: EffortLabel
  sets: CloudSetEntry[]
}
interface WorkoutRow {
  user_id: string
  date: string
  group: string | null
  exercises: CloudExerciseEntry[]
  duration: number | null
  feel: string | null
}
interface ProfileRow {
  id: string
  name: string | null
  age: number | null
  goal: string | null
  equipment: string[]
  weekly_target: number | null
  label_style: string | null
}

export function historyEntryToRow(userId: string, entry: HistoryEntry): WorkoutRow {
  return {
    user_id: userId,
    date: entry.date,
    group: entry.group ?? null,
    exercises: entry.items.map((it) => ({
      id: it.id,
      effort: it.effort,
      sets: it.log.map((s) => ({ reps: s.reps, weight: s.weight, completedAt: s.completedAt })),
    })),
    duration: entry.mins,
    feel: entry.feel ?? null,
  }
}

function rowToHistoryEntry(row: WorkoutRow): HistoryEntry {
  const items: HistoryItemEntry[] = (row.exercises ?? []).map((e) => ({
    id: e.id,
    effort: e.effort,
    log: (e.sets ?? []).map((s) => ({ reps: s.reps, weight: s.weight, completedAt: s.completedAt })),
    swaps: [],
  }))
  const sets = items.reduce((a, it) => a + it.log.filter((s) => s.completedAt != null).length, 0)
  const reps = items.reduce((a, it) => a + it.log.reduce((b, s) => b + (s.reps ?? 0), 0), 0)
  const volume = items.reduce((a, it) => a + it.log.reduce((b, s) => b + (s.reps ?? 0) * (s.weight ?? 0), 0), 0)
  return {
    date: row.date,
    // Vestigial once `group` is present (see History.tsx) — pulled-from-cloud
    // entries always have `group`, so this fallback value is never read.
    dayIndex: 0,
    sets,
    reps,
    volume,
    items,
    mins: row.duration ?? 0,
    feel: row.feel ?? undefined,
    group: (row.group as HistoryEntry['group']) ?? undefined,
  }
}

export function profileToRow(userId: string, profile: Profile, name: string | null): ProfileRow {
  return {
    id: userId,
    name,
    age: profile.age ?? null,
    goal: profile.goal,
    equipment: profile.equip,
    weekly_target: profile.target,
    label_style: profile.effortStyle ?? null,
  }
}

/** Local wins on a same-date collision — the device you're actively on is
 *  the most "live" one. This is what makes upload-then-download safe to run
 *  as one idempotent step: any date present on both sides converges to a
 *  single row instead of duplicating. */
export function mergeHistoryByDate(local: HistoryEntry[], remote: HistoryEntry[]): HistoryEntry[] {
  const byDate = new Map<string, HistoryEntry>()
  for (const r of remote) byDate.set(r.date, r)
  for (const l of local) byDate.set(l.date, l)
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export async function pullHistory(userId: string): Promise<HistoryEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('workouts').select('*').eq('user_id', userId).order('date', { ascending: true })
  if (error || !data) return []
  return (data as WorkoutRow[]).map(rowToHistoryEntry)
}

/** Upsert on (user_id, date) — the unique constraint in supabase/schema.sql
 *  is what makes this safe to call repeatedly with overlapping data instead
 *  of ever creating duplicate rows. */
export async function pushHistory(userId: string, history: HistoryEntry[]): Promise<boolean> {
  if (!supabase || !history.length) return true
  const rows = history.map((h) => historyEntryToRow(userId, h))
  const { error } = await supabase.from('workouts').upsert(rows, { onConflict: 'user_id,date' })
  return !error
}

export async function pushProfile(userId: string, profile: Profile, name: string | null): Promise<boolean> {
  if (!supabase) return true
  const { error } = await supabase.from('profiles').upsert(profileToRow(userId, profile, name), { onConflict: 'id' })
  return !error
}

/** The one full reconcile, run once per sign-in (see SyncBridge): pull
 *  whatever's already in the cloud (nothing, for a first-ever sign-in;
 *  everything, for a second device), merge with what's on this device, push
 *  the union back up, and hand the merged set back so the caller can apply
 *  it locally — this is how a second device actually ends up seeing
 *  progress from the first one, not just a one-way upload. */
export async function reconcileHistoryOnSignIn(userId: string, localHistory: HistoryEntry[]): Promise<HistoryEntry[]> {
  const remote = await pullHistory(userId)
  const merged = mergeHistoryByDate(localHistory, remote)
  await pushHistory(userId, merged)
  return merged
}
