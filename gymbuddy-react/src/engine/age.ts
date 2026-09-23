import type { AgeBracket, Equip, EffortLabel, EffortStyle } from './types'

/** No medical claims — this is general beginner-gym pacing guidance only,
 *  adjustable any time in Settings, never fetched from anywhere external. */
export function ageBracketFor(age: number | null | undefined): AgeBracket | null {
  if (age == null || !Number.isFinite(age)) return null
  if (age < 30) return 'under30'
  if (age <= 40) return '30to40'
  return '40plus'
}

/** Under 30: standard, goal-based rest, no override. 30-40 and 40+ raise the
 *  floor (never lower it below what the goal already asks for). */
export function restSecondsFor(goalRestSeconds: number, bracket: AgeBracket | null): number {
  if (bracket === '30to40') return Math.max(goalRestSeconds, 90)
  if (bracket === '40plus') return Math.max(goalRestSeconds, 120)
  return goalRestSeconds
}

export function warmupNote(bracket: AgeBracket | null): string | null {
  if (bracket === 'under30') return 'Quick warm-up: a couple of light, easy reps before your first working set.'
  if (bracket === '30to40') return 'Take 5 minutes to warm up — light cardio or easy reps — before your first exercise.'
  if (bracket === '40plus') return 'Warm up for 5 minutes before you start, and cool down with some easy stretching after.'
  return null
}

export function restReasonNote(bracket: AgeBracket | null): string | null {
  if (bracket === '30to40' || bracket === '40plus') {
    return 'Longer rest set for your age group. You can change this in Settings.'
  }
  return null
}

/** 40+: prefer machine/cable (supported) over dumbbell/barbell (free-weight)
 *  when both are viable for the same pattern — a nudge in exercise scoring,
 *  not a hard rule (the free-weight option is still reachable via Swap). */
export function prefersSupportedEquip(bracket: AgeBracket | null): boolean {
  return bracket === '40plus'
}

export function isSupportedEquip(equip: Equip): boolean {
  return equip === 'machine' || equip === 'cable'
}

/** 40+ default weekly target suggestion (still just a pre-selected chip in
 *  onboarding — the user can always pick 2/3/4 themselves). */
export function suggestedTarget(bracket: AgeBracket | null): number {
  return bracket === '40plus' ? 2 : 3
}

export function startWeightNote(bracket: AgeBracket | null): string | null {
  return bracket === '40plus' ? 'Go one level lighter than the starting weight shown below.' : null
}

export const AGE_BRACKET_LABEL: Record<AgeBracket, string> = {
  under30: 'Under 30',
  '30to40': '30–40',
  '40plus': '40+',
}

/** The default effort-label style for each age bracket, applied once at
 *  onboarding — from then on it's just a Settings preference, independent
 *  of age. Missing age (old profiles predating the required question)
 *  falls back to the middle, least-jargony style. */
export function effortStyleForAge(bracket: AgeBracket | null): EffortStyle {
  if (bracket === 'under30') return 'genz'
  if (bracket === '40plus') return 'classic'
  return 'balanced'
}

export interface EffortLevelContent {
  emoji: string
  label: string
}

/** All three styles describe the same four underlying effort levels, stored
 *  identically as "casual"|"sigma"|"god"|"aura" — only the label+emoji
 *  shown to the user changes. */
export const EFFORT_STYLES: Record<EffortStyle, Record<EffortLabel, EffortLevelContent>> = {
  genz: {
    casual: { emoji: '😌', label: 'Casual Arc' },
    sigma: { emoji: '😎', label: 'Sigma Arc' },
    god: { emoji: '⚡', label: 'God Mode' },
    aura: { emoji: '🔥', label: 'Aura Farming' },
  },
  balanced: {
    casual: { emoji: '🙂', label: 'Comfortable' },
    sigma: { emoji: '💪', label: 'Solid Effort' },
    god: { emoji: '🔥', label: 'Pushed Hard' },
    aura: { emoji: '🏆', label: 'All Out' },
  },
  classic: {
    casual: { emoji: '✓', label: 'Easy' },
    sigma: { emoji: '✓✓', label: 'Moderate' },
    god: { emoji: '▲', label: 'Hard' },
    aura: { emoji: '★', label: 'Maximum' },
  },
}

export const EFFORT_STYLE_LABEL: Record<EffortStyle, string> = {
  genz: 'Gen-Z mode',
  balanced: 'Balanced',
  classic: 'Classic',
}

export const EFFORT_LEVEL_ORDER: EffortLabel[] = ['casual', 'sigma', 'god', 'aura']
