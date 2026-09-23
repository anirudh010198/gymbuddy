import { describe, expect, it } from 'vitest'
import { gymStatusNow, heatmapFor } from './busyMap'
import { reportsForSampleGym, SAMPLE_GYMS } from './sampleGyms'

describe('sample gyms', () => {
  it('provides four distinct, clearly classified sample locations with deterministic reports', () => {
    expect(SAMPLE_GYMS.map((g) => g.kind)).toEqual(['Budget gym', 'Premium gym', 'Society gym', '24-hour gym'])
    expect(new Set(SAMPLE_GYMS.map((g) => g.code)).size).toBe(4)
    for (const gym of SAMPLE_GYMS) {
      const reports = reportsForSampleGym(gym)
      expect(reports.length).toBeGreaterThan(100)
      expect(reports.every((r) => r.gymCode === gym.code)).toBe(true)
      expect(Object.keys(heatmapFor(reports).countsByEquipment).length).toBeGreaterThan(1)
      expect(gymStatusNow(reports)).not.toBeNull()
    }
  })

  it('models distinct daily rhythms across gym types', () => {
    const budget = SAMPLE_GYMS.find((g) => g.id === 'budget')!
    const society = SAMPLE_GYMS.find((g) => g.id === 'society')!
    expect(budget.peak(19, 2)).toBeGreaterThan(budget.peak(11, 2))
    expect(society.peak(7, 2)).toBeGreaterThan(society.peak(13, 2))
  })
})
