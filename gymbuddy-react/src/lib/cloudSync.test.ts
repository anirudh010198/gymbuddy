import { describe, expect, it } from 'vitest'
import { mergeHistoryByDate, historyEntryToRow } from './cloudSync'
import type { HistoryEntry } from '../engine/types'

function entry(date: string, overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    date,
    dayIndex: 0,
    sets: 9,
    reps: 90,
    volume: 900,
    mins: 20,
    items: [{ id: 'leg_press', log: [{ reps: 10, weight: 40, completedAt: 1 }], swaps: [], effort: 'god' }],
    group: 'legs',
    ...overrides,
  }
}

describe('mergeHistoryByDate', () => {
  it('unions entries present on only one side', () => {
    const local = [entry('2026-01-01')]
    const remote = [entry('2026-01-02')]
    const merged = mergeHistoryByDate(local, remote)
    expect(merged.map((e) => e.date)).toEqual(['2026-01-01', '2026-01-02'])
  })

  it('never duplicates a date present on both sides', () => {
    const local = [entry('2026-01-01')]
    const remote = [entry('2026-01-01')]
    const merged = mergeHistoryByDate(local, remote)
    expect(merged).toHaveLength(1)
  })

  it('local wins on a same-date collision', () => {
    const local = [entry('2026-01-01', { reps: 111 })]
    const remote = [entry('2026-01-01', { reps: 999 })]
    const merged = mergeHistoryByDate(local, remote)
    expect(merged[0].reps).toBe(111)
  })

  it('sorts the merged result by date', () => {
    const local = [entry('2026-01-03'), entry('2026-01-01')]
    const remote = [entry('2026-01-02')]
    const merged = mergeHistoryByDate(local, remote)
    expect(merged.map((e) => e.date)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03'])
  })

  it('is idempotent — merging a result with itself changes nothing', () => {
    const local = [entry('2026-01-01'), entry('2026-01-02')]
    const once = mergeHistoryByDate(local, [])
    const twice = mergeHistoryByDate(once, once)
    expect(twice).toEqual(once)
  })
})

describe('historyEntryToRow', () => {
  it('carries the per-exercise effort rating through, and drops swaps/tips (deliberately not synced)', () => {
    const row = historyEntryToRow('user-1', entry('2026-01-01'))
    expect(row.user_id).toBe('user-1')
    expect(row.date).toBe('2026-01-01')
    expect(row.group).toBe('legs')
    expect(row.exercises).toEqual([{ id: 'leg_press', effort: 'god', sets: [{ reps: 10, weight: 40, completedAt: 1 }] }])
  })
})
