import { describe, expect, it } from 'vitest'
import { BY_ID } from './exercises'
import { buildGroupWorkout, suggestNextGroup } from './swap'
import type { Equip } from './types'

const FULL_EQUIP: Equip[] = ['machine', 'cable', 'dumbbell', 'barbell']

describe('buildGroupWorkout', () => {
  it('quick: picks exactly one exercise per pattern, no pattern repeated, all from the chosen group', () => {
    const picks = buildGroupWorkout('legs', 'quick', FULL_EQUIP)
    expect(picks).toHaveLength(3)
    const patterns = picks.map((p) => p.pattern)
    expect(new Set(patterns).size).toBe(3) // no duplicates
    for (const p of picks) expect(BY_ID[p.id].group).toBe('legs')
  })

  it('full: picks up to 6 unique exercises, mains before accessories, all from the chosen group', () => {
    for (const group of ['legs', 'push', 'pull'] as const) {
      const picks = buildGroupWorkout(group, 'full', FULL_EQUIP)
      expect(picks.length).toBeLessThanOrEqual(6)
      expect(picks.length).toBeGreaterThan(3) // more than a Quick session
      const ids = picks.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length) // never the same exercise twice
      for (const p of picks) expect(BY_ID[p.id].group).toBe(group)
      // mains never appear after an accessory has started
      const firstAccessoryIx = picks.findIndex((p) => p.role === 'accessory')
      if (firstAccessoryIx !== -1) {
        expect(picks.slice(firstAccessoryIx).every((p) => p.role === 'accessory')).toBe(true)
      }
    }
  })

  it('full falls back toward bodyweight when equipment is scarce, never crashing', () => {
    const picks = buildGroupWorkout('legs', 'full', [])
    expect(picks.length).toBeGreaterThan(0)
    for (const p of picks) expect(BY_ID[p.id]).toBeDefined()
  })
})

describe('suggestNextGroup', () => {
  it('suggests legs first with no prior history', () => {
    expect(suggestNextGroup(null)).toBe('legs')
  })
  it('rotates legs -> push -> pull -> legs', () => {
    expect(suggestNextGroup('legs')).toBe('push')
    expect(suggestNextGroup('push')).toBe('pull')
    expect(suggestNextGroup('pull')).toBe('legs')
  })
})
