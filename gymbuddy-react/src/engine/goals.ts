import type { Equip, GoalKey } from './types'

export interface Goal {
  label: string
  sub: string
  reps: string
  rest: number
}

export const GOALS: Record<GoalKey, Goal> = {
  fat: { label: 'Lose fat', sub: 'Burn more, feel lighter', reps: '12–15', rest: 45 },
  muscle: { label: 'Build muscle', sub: 'Get stronger, look fitter', reps: '8–12', rest: 90 },
  fit: { label: 'Get generally fit', sub: 'Energy, stamina, habit', reps: '10–12', rest: 60 },
}

export interface EquipOption {
  key: Equip
  label: string
  sub: string
}

export const EQUIP_OPTIONS: EquipOption[] = [
  { key: 'machine', label: 'Machines', sub: 'Leg press, chest press, etc.' },
  { key: 'cable', label: 'Cable station', sub: 'Lat pulldown, rows' },
  { key: 'dumbbell', label: 'Dumbbells & bench', sub: '' },
  { key: 'barbell', label: 'Barbells', sub: 'Not needed in V1 plans' },
]

/** Quick sessions use 3 sets per exercise; Full sessions use 3 for compounds
 *  (role: main) and 2 for accessories — see engine/groups.ts buildGroupWorkout. */
export const SETS = 3
export const FULL_ACCESSORY_SETS = 2

/** Per-set rep targets (heavier/lower-rep as the set number increases for
 *  Build muscle; flatter for Lose fat/Get fit). Sliced to the exercise's
 *  actual set count (3 for compounds, 2 for accessories in a Full session). */
const REP_TARGETS: Record<GoalKey, [number, number, number]> = {
  muscle: [12, 10, 8],
  fat: [15, 15, 12],
  fit: [12, 12, 10],
}

export function repTargetsFor(goal: GoalKey, setCount: number): number[] {
  return REP_TARGETS[goal].slice(0, setCount)
}
