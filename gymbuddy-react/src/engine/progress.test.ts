import { describe, expect, it } from 'vitest'
import { compareToLast, defaultSetsFor, exerciseHasPB, findLastLog } from './progress'
import type { HistoryEntry, SetEntry } from './types'

function entry(date: string, id: string, log: SetEntry[]): HistoryEntry {
  return { date, dayIndex: 0, sets: log.length, reps: 0, volume: 0, mins: 20, items: [{ id, log, swaps: [] }] }
}

describe('findLastLog / defaultSetsFor', () => {
  it('pre-fills from the most recent log for that exercise, repeating the last set if fewer sets logged', () => {
    const history = [
      entry('2026-09-01', 'leg_press', [
        { reps: 12, weight: 20, completedAt: 1 },
        { reps: 10, weight: 20, completedAt: 2 },
      ]),
    ]
    const sets = defaultSetsFor('leg_press', 'fit', history, 3)
    expect(sets.map((s) => s.reps)).toEqual([12, 10, 10]) // 3rd set repeats the last known set
    expect(sets.every((s) => s.weight === 20)).toBe(true)
    expect(sets.every((s) => s.completedAt === null)).toBe(true)
  })

  it('falls back to the per-set rep target (heavier/lower-rep per set) with a blank weight on a true first time', () => {
    const sets = defaultSetsFor('leg_press', 'muscle', [], 3)
    expect(sets.map((s) => s.reps)).toEqual([12, 10, 8]) // Build muscle's 3-set target ladder
    expect(sets.every((s) => s.weight === null)).toBe(true)
  })

  it('ignores an exercise with no completed sets in history', () => {
    const history = [entry('2026-09-01', 'leg_press', [{ reps: 12, weight: 20, completedAt: null }])]
    expect(findLastLog(history, 'leg_press')).toBeNull()
  })
})

describe('compareToLast', () => {
  const last: SetEntry[] = [
    { reps: 10, weight: 20, completedAt: 1 },
    { reps: 10, weight: 20, completedAt: 2 },
  ]

  it('shows an up arrow when total reps increased', () => {
    const current: SetEntry[] = [
      { reps: 12, weight: 20, completedAt: 1 },
      { reps: 10, weight: 20, completedAt: 2 },
    ]
    expect(compareToLast(current, last)).toEqual({ arrow: 'up', label: '+2 reps' })
  })

  it('falls back to weight comparison when reps are unchanged', () => {
    const current: SetEntry[] = [
      { reps: 10, weight: 22.5, completedAt: 1 },
      { reps: 10, weight: 22.5, completedAt: 2 },
    ]
    expect(compareToLast(current, last)).toEqual({ arrow: 'up', label: '+2.5 kg' })
  })

  it('reports "First time" with no prior log, never a down arrow for a first attempt', () => {
    expect(compareToLast(last, null)).toEqual({ arrow: 'same', label: 'First time' })
  })
})

describe('exerciseHasPB', () => {
  it('flags a set that beats the best reps ever logged at that exact weight', () => {
    const prior = [entry('2026-09-01', 'lat_pulldown', [{ reps: 10, weight: 25, completedAt: 1 }])]
    const todayLog: SetEntry[] = [{ reps: 11, weight: 25, completedAt: 10 }]
    expect(exerciseHasPB(prior, 'lat_pulldown', todayLog)).toBe(true)
  })

  it('flags a new top weight even at fewer reps', () => {
    const prior = [entry('2026-09-01', 'lat_pulldown', [{ reps: 10, weight: 25, completedAt: 1 }])]
    const todayLog: SetEntry[] = [{ reps: 6, weight: 30, completedAt: 10 }]
    expect(exerciseHasPB(prior, 'lat_pulldown', todayLog)).toBe(true)
  })

  it('does not flag a set that neither beats reps-at-weight nor sets a new top weight', () => {
    const prior = [entry('2026-09-01', 'lat_pulldown', [{ reps: 10, weight: 25, completedAt: 1 }])]
    const todayLog: SetEntry[] = [{ reps: 8, weight: 25, completedAt: 10 }]
    expect(exerciseHasPB(prior, 'lat_pulldown', todayLog)).toBe(false)
  })
})
