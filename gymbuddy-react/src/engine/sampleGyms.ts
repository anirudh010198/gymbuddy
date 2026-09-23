import { EXERCISES } from './exercises'
import { gymCodeFor } from './gym'
import type { BusyReport } from './busyMap'
import type { Equip } from './types'

export interface SampleGym {
  id: 'budget' | 'premium' | 'society' | 'twenty_four_hour'
  name: string
  kind: string
  code: string
  /** Relative peak busy intensity by hour, used to make clearly illustrative sample data. */
  peak: (hour: number, day: number) => number
}

const eveningPeak = (hour: number) => Math.max(0, 1 - Math.abs(hour - 19) / 5)
const morningPeak = (hour: number) => Math.max(0, 1 - Math.abs(hour - 7) / 3)

export const SAMPLE_GYMS: SampleGym[] = [
  {
    id: 'budget', name: 'Sample gym · Budget', kind: 'Budget gym',
    code: gymCodeFor('GymBuddy Sample Budget', 1, 1),
    peak: (h, d) => Math.min(1, eveningPeak(h) * (d === 0 ? 0.55 : 1)),
  },
  {
    id: 'premium', name: 'Sample gym · Premium', kind: 'Premium gym',
    code: gymCodeFor('GymBuddy Sample Premium', 2, 2),
    peak: (h) => Math.min(1, Math.max(eveningPeak(h) * 0.85, morningPeak(h) * 0.8)),
  },
  {
    id: 'society', name: 'Sample gym · Society', kind: 'Society gym',
    code: gymCodeFor('GymBuddy Sample Society', 3, 3),
    peak: (h) => Math.min(1, Math.max(morningPeak(h), eveningPeak(h) * 0.65)),
  },
  {
    id: 'twenty_four_hour', name: 'Sample gym · 24-hour', kind: '24-hour gym',
    code: gymCodeFor('GymBuddy Sample 24 Hour', 4, 4),
    peak: (h) => Math.min(1, Math.max(0.22, eveningPeak(h) * 0.7, morningPeak(h) * 0.65)),
  },
]

const equipmentExercise = new Map<Equip, string>()
for (const exercise of EXERCISES) if (!equipmentExercise.has(exercise.equip)) equipmentExercise.set(exercise.equip, exercise.id)

/** Explicitly synthetic, deterministic four-week sample reports. This data is
 *  local to the selected sample location and is never mixed into a real gym. */
export function reportsForSampleGym(gym: SampleGym): BusyReport[] {
  const reports: BusyReport[] = []
  const equipment = [...equipmentExercise.entries()]
  for (let day = 0; day < 7; day++) {
    for (let hour = 5; hour <= 23; hour++) {
      const peak = gym.peak(hour, day)
      for (const [equipIndex, [equip, exerciseId]] of equipment.entries()) {
        for (let week = 0; week < 4; week++) {
          // Quiet bands still have a small sample. Peak hour bands accumulate
          // 3+ reports on popular stations so the busy/free distinction is visible.
          const wobble = ((day * 13 + hour * 7 + equipIndex * 5 + week * 3) % 7) / 20
          const count = peak > 0.58 ? 3 + ((day + equipIndex + week) % 2) : peak > 0.25 ? 1 + ((day + week) % 2) : wobble > 0.17 ? 1 : 0
          for (let i = 0; i < count; i++) reports.push({ exerciseId, equipment: equip, gymCode: gym.code, dayOfWeek: day, hourOfDay: hour })
        }
      }
    }
  }
  return reports
}
