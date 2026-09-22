import type { Group, Pattern } from './types'

/** Each workout: one Legs, one Push, one Pull, rotating A/B. */
export const TEMPLATES: Pattern[][] = [
  ['squat', 'hpush', 'vpull'],
  ['hinge', 'vpush', 'hpull'],
]

export const GROUP_LABEL: Record<Group, string> = {
  legs: 'Legs',
  push: 'Push',
  pull: 'Pull',
}
