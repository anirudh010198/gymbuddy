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

export interface HistoryEntry {
  date: string
  dayIndex: number
  sets: number
  items: { id: string; sets: number; swaps: Swap[] }[]
  mins: number
  feel?: string
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
