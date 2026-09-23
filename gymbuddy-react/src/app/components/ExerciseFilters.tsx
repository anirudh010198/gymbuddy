import type { Equip } from '../../engine/types'

/** Shared with /exercises so the "Build my own" picker offers exactly the
 *  same search and filters, not a similar-but-drifted copy. */
export const EQUIP_FILTER_OPTIONS: { key: Equip; label: string }[] = [
  { key: 'machine', label: 'Machine' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'cable', label: 'Cable' },
  { key: 'barbell', label: 'Barbell' },
  { key: 'bodyweight', label: 'Bodyweight' },
]

export const LEVEL_FILTER_OPTIONS = [1, 2, 3] as const

export function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${pressed ? 'border-plate bg-plate/20' : 'border-line bg-card'}`}
    >
      {children}
    </button>
  )
}
