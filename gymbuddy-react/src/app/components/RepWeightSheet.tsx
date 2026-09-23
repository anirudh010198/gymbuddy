import { useEffect, useRef } from 'react'
import Sheet from './Sheet'
import { PrimaryButton } from './ui'
import { weightStep } from '../../engine/progress'
import type { Exercise } from '../../engine/types'

function formatWeight(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1)
}

/** ±5 steps around the current value, drag/tap to pick — the current value
 *  is scrolled into view (centred) as soon as the sheet opens, so there's
 *  never a hunt for "where am I right now". */
function NumberScroller({
  value,
  step,
  format,
  onSelect,
  label,
}: {
  value: number
  step: number
  format: (v: number) => string
  onSelect: (v: number) => void
  label: string
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const options = Array.from({ length: 11 }, (_, i) => Math.round((value + (i - 5) * step) * 10) / 10).filter((v) => v >= 0)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [value])

  return (
    <div
      role="listbox"
      aria-label={label}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-[calc(50%-32px)] py-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {options.map((v) => {
        const active = v === value
        return (
          <button
            key={v}
            ref={active ? activeRef : undefined}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(v)}
            className={`grid h-16 w-16 shrink-0 snap-center place-items-center rounded-2xl border-2 font-display text-xl font-bold transition-colors ${
              active ? 'border-plate bg-plate text-plate-ink' : 'border-line bg-card text-ink'
            }`}
          >
            {format(v)}
          </button>
        )
      })}
    </div>
  )
}

export default function RepWeightSheet({
  open,
  exercise,
  reps,
  weight,
  lastSet,
  onChange,
  onClose,
}: {
  open: boolean
  exercise: Exercise | null
  reps: number
  weight: number | null
  /** The previous set logged on this same exercise, if any — powers "Same
   *  as last set". Absent for the exercise's first set. */
  lastSet: { reps: number; weight: number | null } | null
  onChange: (patch: { reps?: number; weight?: number | null }) => void
  onClose: () => void
}) {
  const step = exercise ? weightStep(exercise, weight) : 2.5
  const w = weight ?? 0

  function applyAndClose(patch: { reps?: number; weight?: number | null }) {
    onChange(patch)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {exercise && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
            {exercise.name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {lastSet && (
              <button
                type="button"
                className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-semibold"
                onClick={() => applyAndClose({ reps: lastSet.reps, weight: lastSet.weight })}
              >
                Same as last set
              </button>
            )}
            {weight != null && (
              <>
                <button
                  type="button"
                  className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-semibold"
                  onClick={() => applyAndClose({ weight: Math.max(0, Math.round((w - step) * 10) / 10) })}
                >
                  −{formatWeight(step)} kg
                </button>
                <button
                  type="button"
                  className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-semibold"
                  onClick={() => applyAndClose({ weight: Math.round((w + step) * 10) / 10 })}
                >
                  +{formatWeight(step)} kg
                </button>
              </>
            )}
            <button
              type="button"
              className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-semibold"
              onClick={() => applyAndClose({ reps: Math.max(0, reps - 1) })}
            >
              −1 rep
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-semibold"
              onClick={() => applyAndClose({ reps: reps + 1 })}
            >
              +1 rep
            </button>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-muted">Reps</div>
            <NumberScroller value={reps} step={1} format={(v) => String(v)} label="Reps" onSelect={(v) => applyAndClose({ reps: v })} />
            <div className="mt-1 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Decrease reps"
                onClick={() => onChange({ reps: Math.max(0, reps - 1) })}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-line font-display text-lg font-bold"
              >
                −
              </button>
              <button
                type="button"
                aria-label="Increase reps"
                onClick={() => onChange({ reps: reps + 1 })}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-line font-display text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {weight != null && (
            <div className="mt-5">
              <div className="text-sm font-semibold text-muted">Weight (kg)</div>
              <NumberScroller
                value={w}
                step={step}
                format={formatWeight}
                label="Weight in kilograms"
                onSelect={(v) => applyAndClose({ weight: v })}
              />
              <div className="mt-1 flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease weight"
                  onClick={() => onChange({ weight: Math.max(0, Math.round((w - step) * 10) / 10) })}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-line font-display text-lg font-bold"
                >
                  −
                </button>
                <button
                  type="button"
                  aria-label="Increase weight"
                  onClick={() => onChange({ weight: Math.round((w + step) * 10) / 10 })}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-line font-display text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <PrimaryButton className="mt-6" onClick={onClose}>
            Done
          </PrimaryButton>
        </>
      )}
    </Sheet>
  )
}
