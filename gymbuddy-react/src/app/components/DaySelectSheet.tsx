import { useState } from 'react'
import Sheet from './Sheet'
import { suggestNextGroup } from '../../engine/swap'
import { GROUP_LABEL } from '../../engine/templates'
import type { Group, SavedCustomWorkout, SessionLength } from '../../engine/types'

const DAY_OPTIONS: { group: Group; label: string; sub: string }[] = [
  { group: 'legs', label: 'Legs', sub: 'Quads, hamstrings, glutes' },
  { group: 'push', label: 'Push', sub: 'Chest, shoulders, triceps' },
  { group: 'pull', label: 'Pull', sub: 'Back, biceps' },
]

export default function DaySelectSheet({
  open,
  lastGroup,
  suggestFull,
  lastCustomWorkout,
  onStart,
  onBuildOwn,
  onRepeatCustom,
  onClose,
}: {
  open: boolean
  lastGroup: Group | null | undefined
  /** History.length >= 2 — after the first 2 workouts, Full is pre-selected instead of Quick. */
  suggestFull: boolean
  lastCustomWorkout: SavedCustomWorkout | null
  onStart: (group: Group, length: SessionLength) => void
  onBuildOwn: () => void
  onRepeatCustom: () => void
  onClose: () => void
}) {
  const [length, setLength] = useState<SessionLength>(suggestFull ? 'full' : 'quick')
  const suggested = suggestNextGroup(lastGroup)

  function pick(group: Group) {
    onStart(group, length)
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
        What are you training today?
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Session length">
        <button
          type="button"
          aria-pressed={length === 'quick'}
          onClick={() => setLength('quick')}
          className={`rounded-2xl border-2 p-3 text-left ${length === 'quick' ? 'border-plate bg-plate/10' : 'border-line'}`}
        >
          <div className="font-display font-bold">Quick</div>
          <div className="text-xs text-muted">4 exercises, ~30 min</div>
        </button>
        <button
          type="button"
          aria-pressed={length === 'full'}
          onClick={() => setLength('full')}
          className={`rounded-2xl border-2 p-3 text-left ${length === 'full' ? 'border-plate bg-plate/10' : 'border-line'}`}
        >
          <div className="font-display font-bold">Full</div>
          <div className="text-xs text-muted">6 exercises, ~45 min</div>
        </button>
      </div>

      <div className="mt-4 grid max-h-[55vh] gap-2 overflow-y-auto">
        {DAY_OPTIONS.map((o) => (
          <button
            key={o.group}
            type="button"
            onClick={() => pick(o.group)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-line bg-card p-4 text-left"
          >
            <div>
              <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                {o.label}
              </div>
              <div className="text-sm text-muted">{o.sub}</div>
            </div>
            {suggested === o.group && (
              <span className="shrink-0 rounded-full bg-plate px-2 py-0.5 text-xs font-bold text-plate-ink">Suggested</span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => pick(suggested)}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-line bg-card p-4 text-left"
        >
          <div>
            <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
              Pick for me
            </div>
            <div className="text-sm text-muted">We'll rotate to whatever you trained least recently.</div>
          </div>
        </button>
        <button
          type="button"
          onClick={onBuildOwn}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-line bg-card p-4 text-left"
        >
          <div>
            <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
              Build my own
            </div>
            <div className="text-sm text-muted">Pick your own exercises, sets and reps.</div>
          </div>
        </button>
        {lastCustomWorkout && (
          <button
            type="button"
            onClick={onRepeatCustom}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-line bg-card p-4 text-left"
          >
            <div>
              <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                Repeat my last custom workout
              </div>
              <div className="text-sm text-muted">
                {lastCustomWorkout.picks.length} exercise{lastCustomWorkout.picks.length === 1 ? '' : 's'} ·{' '}
                {lastCustomWorkout.group === 'mixed' ? 'Mixed' : GROUP_LABEL[lastCustomWorkout.group]}
              </div>
            </div>
          </button>
        )}
      </div>
    </Sheet>
  )
}
