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

export const SETS = 3
