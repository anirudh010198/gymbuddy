import Sheet from './Sheet'
import { PrimaryButton } from './ui'
import { weightStep } from '../../engine/progress'
import type { Exercise } from '../../engine/types'

function StepperRow({
  label,
  value,
  onDec,
  onInc,
  format,
}: {
  label: string
  value: number
  onDec: () => void
  onInc: () => void
  format?: (v: number) => string
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={onDec}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-line font-display text-2xl font-bold"
        >
          −
        </button>
        <div className="flex-1 text-center font-display text-3xl font-extrabold">{format ? format(value) : value}</div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={onInc}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-line font-display text-2xl font-bold"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function RepWeightSheet({
  open,
  exercise,
  reps,
  weight,
  onChange,
  onClose,
}: {
  open: boolean
  exercise: Exercise | null
  reps: number
  weight: number | null
  onChange: (patch: { reps?: number; weight?: number | null }) => void
  onClose: () => void
}) {
  const step = exercise ? weightStep(exercise, weight) : 2.5
  const w = weight ?? 0

  return (
    <Sheet open={open} onClose={onClose}>
      {exercise && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
            {exercise.name}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <StepperRow
              label="Reps"
              value={reps}
              onDec={() => onChange({ reps: Math.max(0, reps - 1) })}
              onInc={() => onChange({ reps: reps + 1 })}
            />
            <StepperRow
              label="Weight (kg)"
              value={w}
              format={(v) => (v % 1 === 0 ? String(v) : v.toFixed(1))}
              onDec={() => onChange({ weight: Math.max(0, Math.round((w - step) * 10) / 10) })}
              onInc={() => onChange({ weight: Math.round((w + step) * 10) / 10 })}
            />
          </div>
          <PrimaryButton className="mt-6" onClick={onClose}>
            Done
          </PrimaryButton>
        </>
      )}
    </Sheet>
  )
}
