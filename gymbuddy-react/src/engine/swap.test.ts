import { describe, expect, it } from 'vitest'
import { BY_ID } from './exercises'
import { swapCandidate } from './swap'
import type { Equip, WorkoutItem } from './types'

// Machine + cable + dumbbell gym: plenty of candidates in every tier for
// squat (legs/main pattern), so these tests exercise real pools, not just
// the guaranteed bodyweight fallback.
const FULL_EQUIP: Equip[] = ['machine', 'cable', 'dumbbell', 'barbell']

describe('swapCandidate', () => {
  it('never repeats a tried exercise', () => {
    let item: WorkoutItem = { pattern: 'squat', id: 'leg_press', swaps: [] }
    const seen = new Set([item.id])

    // Keep swapping for "busy" until the pool is exhausted (null).
    let next = swapCandidate(item, 'busy', FULL_EQUIP)
    while (next) {
      expect(seen.has(next.id)).toBe(false)
      item = { ...item, id: next.id, swaps: [...item.swaps, { from: item.id, to: next.id, reason: 'busy' }] }
      seen.add(next.id)
      next = swapCandidate(item, 'busy', FULL_EQUIP)
    }
    // Exhausted every squat/legs-group/bodyweight candidate without a repeat.
    expect(seen.size).toBeGreaterThan(1)
  })

  it('busy prefers a different equipment type than the current exercise', () => {
    const item: WorkoutItem = { pattern: 'squat', id: 'leg_press', swaps: [] } // machine
    const next = swapCandidate(item, 'busy', FULL_EQUIP)
    expect(next).not.toBeNull()
    expect(next!.equip).not.toBe(BY_ID['leg_press'].equip)
  })

  it('pain prefers the lowest level exercise available in the whole group', () => {
    const item: WorkoutItem = { pattern: 'hinge', id: 'hip_thrust', swaps: [] } // level 2
    const next = swapCandidate(item, 'pain', FULL_EQUIP)
    expect(next).not.toBeNull()

    // The Change-exercise pool is the whole legs group now, not just the
    // hinge pattern — every other available legs candidate should have
    // level >= the chosen one.
    const cur = BY_ID['hip_thrust']
    const tried = new Set([item.id])
    const pool = Object.values(BY_ID).filter((e) => e.group === cur.group && !tried.has(e.id))
    const minLevel = Math.min(...pool.map((e) => e.level))
    expect(next!.level).toBe(minLevel)
  })

  it('returns null once every exercise in the group has been tried', () => {
    // Bodyweight-only user: availableExercises([]) is bodyweight exercises
    // only, so chaining through every legs-group bodyweight exercise
    // exhausts the whole pool this user could ever see.
    const legsIds = Object.values(BY_ID)
      .filter((e) => e.group === 'legs' && e.equip === 'bodyweight')
      .map((e) => e.id)
    const swaps = legsIds.slice(1).map((id, i) => ({ from: legsIds[i], to: id, reason: 'busy' as const }))
    const item: WorkoutItem = { pattern: 'squat', id: legsIds[legsIds.length - 1], swaps }
    const next = swapCandidate(item, 'busy', [])
    expect(next).toBeNull()
  })
})
