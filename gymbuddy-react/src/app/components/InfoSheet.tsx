import Sheet from './Sheet'
import { PrimaryButton } from './ui'
import type { Exercise } from '../../engine/types'

export type SwapInfo = { type: 'exhausted' } | { type: 'safety'; exerciseName: string } | { type: 'preview'; exercise: Exercise }

export default function InfoSheet({ info, onClose }: { info: SwapInfo | null; onClose: () => void }) {
  return (
    <Sheet open={!!info} onClose={onClose}>
      {info?.type === 'exhausted' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
            No more options here
          </h2>
          <p className="mt-2 text-muted">
            You've tried every alternative for this muscle group with your equipment. Skip this one today; the other two still
            count.
          </p>
          <PrimaryButton className="mt-4" onClick={onClose}>
            OK
          </PrimaryButton>
        </>
      )}
      {info?.type === 'safety' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
            Swapped to {info.exerciseName}
          </h2>
          <p className="mt-2">
            Muscle burn and next-day soreness are normal. <b>Sharp pain, joint pain, or pain that doesn't fade are not.</b> If
            that's what you felt, stop that movement today and ask a gym trainer or a doctor before repeating it.
          </p>
          <PrimaryButton className="mt-4" onClick={onClose}>
            Got it
          </PrimaryButton>
        </>
      )}
      {info?.type === 'preview' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
            {info.exercise.name}
          </h2>
          <div className="mt-1 text-sm font-semibold text-muted">{info.exercise.muscles}</div>
          <p className="mt-3">
            <b>How:</b> {info.exercise.how}
          </p>
          <p className="mt-1 text-sm text-muted">
            <b>Avoid:</b> {info.exercise.avoid} <b>Start:</b> {info.exercise.start}
          </p>
          <PrimaryButton className="mt-4" onClick={onClose}>
            Got it
          </PrimaryButton>
        </>
      )}
    </Sheet>
  )
}
