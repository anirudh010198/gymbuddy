import { describe, expect, it } from 'vitest'
import { addDays, weekStart } from './dates'
import { streakWeeks } from './streak'
import type { HistoryEntry } from './types'

const TARGET = 3

function mkEntry(date: string): HistoryEntry {
  return { date, dayIndex: 0, sets: 9, items: [], mins: 20 }
}

describe('streakWeeks', () => {
  it('ignores an unfinished current week without breaking the streak', () => {
    const todayStr = '2026-09-24' // mocked "today"
    const thisWeekStart = weekStart(todayStr)
    const lastWeekStart = addDays(thisWeekStart, -7)
    const twoWeeksAgoStart = addDays(thisWeekStart, -14)

    const history: HistoryEntry[] = [
      // two full past weeks (3 distinct days each) meeting target
      mkEntry(twoWeeksAgoStart), mkEntry(addDays(twoWeeksAgoStart, 1)), mkEntry(addDays(twoWeeksAgoStart, 2)),
      mkEntry(lastWeekStart), mkEntry(addDays(lastWeekStart, 1)), mkEntry(addDays(lastWeekStart, 2)),
      // current week: only 1 workout so far — below target, still in progress
      mkEntry(thisWeekStart),
    ]

    expect(streakWeeks(history, TARGET, todayStr)).toBe(2)
  })

  it('counts the current week once it independently meets target', () => {
    const todayStr = '2026-09-24'
    const thisWeekStart = weekStart(todayStr)
    const history: HistoryEntry[] = [
      mkEntry(thisWeekStart),
      mkEntry(addDays(thisWeekStart, 1)),
      mkEntry(addDays(thisWeekStart, 2)),
    ]
    expect(streakWeeks(history, TARGET, todayStr)).toBe(1)
  })

  it('breaks the streak on a fully missed past week', () => {
    const todayStr = '2026-09-24'
    const thisWeekStart = weekStart(todayStr)
    const twoWeeksAgoStart = addDays(thisWeekStart, -14)
    // last week (in between) has zero sessions — streak should stop there.
    const history: HistoryEntry[] = [
      mkEntry(twoWeeksAgoStart), mkEntry(addDays(twoWeeksAgoStart, 1)), mkEntry(addDays(twoWeeksAgoStart, 2)),
    ]
    expect(streakWeeks(history, TARGET, todayStr)).toBe(0)
  })
})
