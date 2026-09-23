import type { Equip, Group } from './types'

export interface WarmupMove {
  text: string
}

/** 3 concrete movements per group, ~3-5 minutes total — shown once before the
 *  first exercise of a session (see app/screens/Warmup.tsx). 'mixed' (a
 *  "Build my own" session not scoped to one group) gets a generic full-body
 *  version rather than guessing which group matters most. */
export const WARMUP_CONTENT: Record<Group | 'mixed', WarmupMove[]> = {
  legs: [
    { text: '2 minutes of easy walking or cycling' },
    { text: '10 bodyweight squats' },
    { text: '10 leg swings each side' },
  ],
  push: [
    { text: '2 minutes of easy walking or arm circles' },
    { text: '10 incline or knee push-ups' },
    { text: '10 arm circles each direction' },
  ],
  pull: [
    { text: '2 minutes of easy walking or rowing' },
    { text: '10 scapular pulls or band pull-aparts' },
    { text: '10 arm swings each direction' },
  ],
  mixed: [
    { text: '2-3 minutes of easy walking or cycling' },
    { text: '10 bodyweight squats' },
    { text: '10 arm circles each direction' },
  ],
}

/** 2-3 stretches per group, 30 seconds each — shown after "Finish workout"
 *  is confirmed, always skippable. */
export const COOLDOWN_CONTENT: Record<Group | 'mixed', WarmupMove[]> = {
  legs: [
    { text: 'Standing quad stretch — 30s each side' },
    { text: 'Seated hamstring stretch — 30s each side' },
    { text: 'Calf stretch against a wall — 30s each side' },
  ],
  push: [
    { text: 'Doorway chest stretch — 30s' },
    { text: 'Overhead triceps stretch — 30s each side' },
    { text: 'Cross-body shoulder stretch — 30s each side' },
  ],
  pull: [
    { text: "Child's pose lat stretch — 30s" },
    { text: 'Cross-body shoulder stretch — 30s each side' },
    { text: 'Neck side stretch — 30s each side' },
  ],
  mixed: [
    { text: 'Standing quad stretch — 30s each side' },
    { text: 'Doorway chest stretch — 30s' },
    { text: "Child's pose lat stretch — 30s" },
  ],
}

/** Where to physically find each equipment type, for the between-exercise
 *  transition card ("It's in the machine section."). */
export function equipSectionLabel(equip: Equip): string {
  switch (equip) {
    case 'machine':
      return 'the machine section'
    case 'cable':
      return 'the cable station'
    case 'dumbbell':
      return 'the dumbbell rack'
    case 'barbell':
      return 'the barbell area'
    case 'bodyweight':
      return 'the open floor space'
  }
}
