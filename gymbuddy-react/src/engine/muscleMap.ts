import type { Group } from './types'

export type MuscleRegion =
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'chest'
  | 'shoulders'
  | 'triceps'
  | 'lats'
  | 'midBack'
  | 'rearShoulders'
  | 'biceps'

export interface MuscleInfo {
  name: string
  side: 'front' | 'back'
}

export const MUSCLE_INFO: Record<MuscleRegion, MuscleInfo> = {
  quads: { name: 'Quads', side: 'front' },
  hamstrings: { name: 'Hamstrings', side: 'back' },
  glutes: { name: 'Glutes', side: 'back' },
  calves: { name: 'Calves', side: 'back' },
  chest: { name: 'Chest', side: 'front' },
  shoulders: { name: 'Shoulders', side: 'front' },
  triceps: { name: 'Triceps', side: 'back' },
  lats: { name: 'Lats', side: 'back' },
  midBack: { name: 'Mid back', side: 'back' },
  rearShoulders: { name: 'Rear shoulders', side: 'back' },
  biceps: { name: 'Biceps', side: 'front' },
}

/** Which regions a session trains, by group — matches the exact lists from
 *  the spec (quads/hamstrings/glutes/calves for legs, etc). Not derived
 *  from individual exercise patterns: distinct exercises within a group
 *  don't cleanly isolate one muscle each in this library, so rather than
 *  guess, every region for the group is shown and fills together as the
 *  session progresses — an honest "here's what this session as a whole
 *  works", not a fabricated per-exercise breakdown. */
export const GROUP_MUSCLES: Record<Group, MuscleRegion[]> = {
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['lats', 'midBack', 'rearShoulders', 'biceps'],
}

/** For a "Build my own" (mixed) session, the muscles trained are whichever
 *  groups its actual exercises belong to — never a guess, just the union of
 *  what's really in the session. */
export function musclesForGroups(groups: Group[]): MuscleRegion[] {
  const seen = new Set<MuscleRegion>()
  const ordered: MuscleRegion[] = []
  for (const g of groups) {
    for (const m of GROUP_MUSCLES[g]) {
      if (!seen.has(m)) {
        seen.add(m)
        ordered.push(m)
      }
    }
  }
  return ordered
}

const GROUP_LABEL_LOWER: Record<Group, string> = { legs: 'legs', push: 'push muscles', pull: 'pull muscles' }

/** "Today you're training your legs: quads, hamstrings, glutes and calves."
 *  (or, on the summary screen after finishing, `pastTense` swaps that to
 *  "Today you trained your legs: ..."). */
export function muscleSummaryLine(groups: Group[], pastTense = false): string {
  const muscles = musclesForGroups(groups)
  const names = muscles.map((m) => MUSCLE_INFO[m].name.toLowerCase())
  const joined =
    names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  const groupWord = groups.length === 1 ? GROUP_LABEL_LOWER[groups[0]] : 'full body'
  const verb = pastTense ? 'you trained' : "you're training"
  return `Today ${verb} your ${groupWord}: ${joined}.`
}
