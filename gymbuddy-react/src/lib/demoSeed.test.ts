import { describe, expect, it } from 'vitest'
import { buildDemoSeed } from './demoSeed'
import { streakWeeks, weekCount } from '../engine/streak'
import { today, weekStart } from '../engine/dates'
import { exerciseHasPB } from '../engine/progress'

describe('buildDemoSeed', () => {
  it('produces exactly 9 workouts over 3 weeks with a 2-week streak', () => {
    const { profile, history } = buildDemoSeed()
    expect(history).toHaveLength(9)
    expect(streakWeeks(history, profile.target)).toBe(2)
    // The current week (containing "today") has no finished history entries
    // — the "9 over 3 weeks" figure doesn't include it, only the in-progress
    // `active` session does (see the next test).
    expect(weekCount(history, weekStart(today()))).toBe(0)
  })

  it('is realistic progression: at least one exercise is a PB on its most recent (3rd) session', () => {
    const { history } = buildDemoSeed()
    // Every exercise recurs 3 times (3 group cycles); its 3rd appearance in
    // chronological order should be the heaviest/highest-rep, hence a PB
    // against everything strictly before it.
    const exerciseId = history[0].items[0].id
    const occurrences = history.map((h, i) => ({ h, i })).filter(({ h }) => h.items.some((it) => it.id === exerciseId))
    expect(occurrences.length).toBe(3)
    const last = occurrences[occurrences.length - 1]
    const priorHistory = history.slice(0, last.i)
    const lastLog = last.h.items.find((it) => it.id === exerciseId)!.log
    expect(exerciseHasPB(priorHistory, exerciseId, lastLog)).toBe(true)
  })

  it('every history item carries an effort rating', () => {
    const { history } = buildDemoSeed()
    for (const h of history) for (const it of h.items) expect(it.effort).toBeDefined()
  })

  it('seeds an in-progress session for today with one exercise already done (fills the muscle map without counting toward the 9)', () => {
    const { active } = buildDemoSeed()
    expect(active).not.toBeNull()
    expect(active!.date).toBe(today())
    expect(active!.finished).toBeFalsy()
    const doneItems = active!.items.filter((it) => it.sets.every((s) => s.completedAt != null))
    expect(doneItems.length).toBeGreaterThan(0)
    expect(doneItems.length).toBeLessThan(active!.items.length)
  })

  it('profile.lastGroup matches the most recent seeded session, so the next suggestion rotates correctly', () => {
    const { profile, history } = buildDemoSeed()
    const mostRecent = [...history].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!
    expect(profile.lastGroup).toBe(mostRecent.group)
  })
})
