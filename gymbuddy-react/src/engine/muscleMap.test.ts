import { describe, expect, it } from 'vitest'
import { GROUP_MUSCLES, musclesForGroups, muscleSummaryLine } from './muscleMap'

describe('musclesForGroups', () => {
  it('returns exactly the spec list for a single group', () => {
    expect(musclesForGroups(['legs'])).toEqual(['quads', 'hamstrings', 'glutes', 'calves'])
    expect(musclesForGroups(['push'])).toEqual(['chest', 'shoulders', 'triceps'])
    expect(musclesForGroups(['pull'])).toEqual(['lats', 'midBack', 'rearShoulders', 'biceps'])
  })

  it('unions groups without duplicates, for a mixed session', () => {
    const result = musclesForGroups(['legs', 'push'])
    expect(result).toEqual([...GROUP_MUSCLES.legs, ...GROUP_MUSCLES.push])
    expect(new Set(result).size).toBe(result.length)
  })
})

describe('muscleSummaryLine', () => {
  it('formats a single-group line with an Oxford "and"', () => {
    expect(muscleSummaryLine(['legs'])).toBe("Today you're training your legs: quads, hamstrings, glutes and calves.")
  })

  it('names "full body" for a session spanning more than one group', () => {
    expect(muscleSummaryLine(['legs', 'push'])).toMatch(/^Today you're training your full body: /)
  })
})
