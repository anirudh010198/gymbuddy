export type Group = 'legs' | 'push' | 'pull'
export type Equip = 'machine' | 'cable' | 'dumbbell' | 'barbell' | 'bodyweight'
export type Pattern = 'squat' | 'hinge' | 'lunge' | 'hpush' | 'vpush' | 'hpull' | 'vpull' | 'arms'
export type Role = 'main' | 'accessory'

export interface Exercise {
  id: string
  name: string
  group: Group
  pattern: Pattern
  role: Role
  equip: Equip
  level: 1 | 2 | 3
  muscles: string
  how: string
  avoid: string
  start: string
  bonusTip: string
  /** One line on what it is and what it works — shown first in the form guide. */
  description: string
  /** How to position yourself and the equipment before the first rep. */
  setup: string
  /** 3 short numbered steps covering the full rep: start -> movement -> return. */
  steps: [string, string, string]
  /** One line, usually "in" on the lowering/reaching phase, "out" on the effort phase. */
  breathing: string
  /** Where the user should feel the work, so they can tell if they're doing it right. */
  feelIt: string
  /** 2 short "this is what good form looks like" cues, shown as checkmarks alongside `avoid`. */
  formCues: [string, string]
}

export type Reason = 'busy' | 'unsure' | 'pain'

export interface Swap {
  from: string
  to: string
  reason: Reason
}

export interface WorkoutItem {
  pattern: Pattern
  id: string
  swaps: Swap[]
}

export interface ActiveWorkout {
  date: string
  dayIndex: number
  items: WorkoutItem[]
  startedAt: number
  finished?: boolean
}

/**
 * A single logged set. `reps` is nullable only to stay compatible with
 * pre-Feature-2 history saved as `done: boolean[]` (an old `true` migrates
 * to `reps: null`, meaning "we know a set happened, not how many reps").
 */
export interface SetEntry {
  reps: number | null
  weight: number | null
  completedAt: number | null
}

export interface HistoryItemEntry {
  id: string
  log: SetEntry[]
  swaps: Swap[]
}

export interface HistoryEntry {
  date: string
  dayIndex: number
  sets: number
  reps: number
  volume: number
  items: HistoryItemEntry[]
  mins: number
  feel?: string
  /** Bonus-tip text unlocked this workout (Build-muscle goal only). */
  tipsUnlocked?: string[]
}

export type GoalKey = 'fat' | 'muscle' | 'fit'

export interface Profile {
  goal: GoalKey
  equip: Equip[]
  target: number
  created: string
}

export interface TrackEvent {
  t: number
  type: string
  [key: string]: unknown
}
