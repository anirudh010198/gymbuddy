import { describe, expect, it } from 'vitest'
import { forecastForSession, gymStatusNow, heatmapFor, type BusyReport } from './busyMap'

function reportAt(exerciseId: string, dayOfWeek: number, hourOfDay: number): BusyReport {
  return { exerciseId, equipment: 'machine', gymCode: 'g1', dayOfWeek, hourOfDay }
}

describe('forecastForSession', () => {
  it('returns null (still learning) below the 3-report band threshold', () => {
    const reports = [reportAt('leg-press', 1, 18), reportAt('leg-press', 1, 18)]
    expect(forecastForSession(reports, ['leg-press'], new Date(2026, 0, 5, 18))).toBeNull() // Mon 18:00
  })

  it('marks an exercise busy once its own hour band hits 3+ reports, free otherwise', () => {
    const reports = [
      reportAt('leg-press', 1, 18),
      reportAt('leg-press', 1, 18),
      reportAt('leg-press', 1, 18),
    ]
    const lines = forecastForSession(reports, ['leg-press', 'cable-row'], new Date(2026, 0, 5, 18))
    expect(lines).toEqual([
      { exerciseId: 'leg-press', status: 'busy', count: 3 },
      { exerciseId: 'cable-row', status: 'free', count: 0 },
    ])
  })

  it('only counts reports in the same day-of-week/hour band, not other hours', () => {
    const reports = [reportAt('leg-press', 1, 9), reportAt('leg-press', 1, 9), reportAt('leg-press', 1, 9)]
    expect(forecastForSession(reports, ['leg-press'], new Date(2026, 0, 5, 18))).toBeNull()
  })
})

describe('heatmapFor', () => {
  it('buckets reports by hour-of-day (5-23) per equipment', () => {
    const reports = [reportAt('leg-press', 1, 5), reportAt('leg-press', 3, 5), reportAt('leg-press', 1, 23)]
    const { hours, countsByEquipment } = heatmapFor(reports)
    expect(hours[0]).toBe(5)
    expect(hours[hours.length - 1]).toBe(23)
    expect(countsByEquipment.machine[0]).toBe(2)
    expect(countsByEquipment.machine[hours.length - 1]).toBe(1)
  })

  it('ignores reports outside the 5-23 hour window', () => {
    const reports = [reportAt('leg-press', 1, 2)]
    const { countsByEquipment } = heatmapFor(reports)
    expect(countsByEquipment.machine).toBeUndefined()
  })
})

describe('gymStatusNow', () => {
  const now = new Date(2026, 0, 5, 18) // Monday 18:00 -> dayOfWeek 1, hourOfDay 18

  it('returns null with no data for this exact hour band, even if the gym has other data', () => {
    const reports = [reportAt('leg-press', 1, 9), reportAt('leg-press', 1, 9), reportAt('leg-press', 1, 9)]
    expect(gymStatusNow(reports, now)).toBeNull()
  })

  it('returns "busy" once any exercise crosses the threshold this hour', () => {
    const reports = [reportAt('leg-press', 1, 18), reportAt('leg-press', 1, 18), reportAt('leg-press', 1, 18)]
    expect(gymStatusNow(reports, now)).toBe('busy')
  })

  it('returns "quiet" when there is data this hour but nothing crosses the threshold', () => {
    const reports = [reportAt('leg-press', 1, 18), reportAt('cable-row', 1, 18)]
    expect(gymStatusNow(reports, now)).toBe('quiet')
  })
})
