import Sheet from './Sheet'
import { PrimaryButton, GhostButton } from './ui'

/** Explicit confirmation before finishWorkout() actually runs — "Finish
 *  workout" on the dock opens this rather than finishing silently. */
export default function FinishSheet({
  open,
  done,
  total,
  onConfirm,
  onClose,
}: {
  open: boolean
  done: number
  total: number
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
        Finish workout?
      </h2>
      <p className="mb-4 text-muted">
        {done}/{total} sets logged
        {done < total ? ' — the rest will be left unfinished.' : '.'}
      </p>
      <div className="grid gap-3">
        <PrimaryButton onClick={onConfirm}>Finish workout</PrimaryButton>
        <GhostButton onClick={onClose}>Keep going</GhostButton>
      </div>
    </Sheet>
  )
}
