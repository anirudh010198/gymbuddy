import { describe, expect, it } from 'vitest'
import { BY_ID } from './exercises'
import { buildGroupWorkout, suggestNextGroup } from './swap'
import type { Equip } from './types'

const FULL_EQUIP: Equip[] = ['machine', 'cable', 'dumbbell', 'barbell']

describe('buildGroupWorkout', () => {
  it('quick: picks 4 unique exercises, all mains (every group has >= 4), all from the chosen group', () => {
    for (const group of ['legs', 'push', 'pull'] as const) {
      const picks = buildGroupWorkout(group, 'quick', FULL_EQUIP)
      expect(picks).toHaveLength(4)
      const ids = picks.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length) // never the same exercise twice
      expect(picks.every((p) => p.role === 'main')).toBe(true)
      for (const p of picks) expect(BY_ID[p.id].group).toBe(group)
    }
  })

  it('full: picks up to 6 unique exercises, mains before accessories, all from the chosen group', () => {
    for (const group of ['legs', 'push', 'pull'] as const) {
      const picks = buildGroupWorkout(group, 'full', FULL_EQUIP)
      expect(picks.length).toBeLessThanOrEqual(6)
      expect(picks.length).toBeGreaterThan(4) // more than a Quick session (4)
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
