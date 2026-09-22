import Sheet from './Sheet'
import { Chip, GhostButton } from './ui'
import type { Reason } from '../../engine/types'

export default function SwapSheet({
  open,
  exerciseName,
  onReason,
  onClose,
}: {
  open: boolean
  exerciseName: string
  onReason: (reason: Reason) => void
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
        Swap {exerciseName}
      </h2>
      <p className="mb-4 text-muted">Why? We'll pick a replacement that works the same muscles.</p>
      <div className="grid gap-3">
        <Chip onClick={() => onReason('busy')}>
          <b className="font-display" style={{ fontSize: '1.25rem' }}>
            It's busy or not here
          </b>
          <br />
          <span className="text-sm text-muted">Get an option on different equipment</span>
        </Chip>
        <Chip onClick={() => onReason('unsure')}>
          <b className="font-display" style={{ fontSize: '1.25rem' }}>
            I don't know how to do it
          </b>
          <br />
          <span className="text-sm text-muted">Get the simplest version</span>
        </Chip>
        <Chip onClick={() => onReason('pain')}>
          <b className="font-display" style={{ fontSize: '1.25rem' }}>
            It hurts or feels wrong
          </b>
          <br />
          <span className="text-sm text-muted">Get a gentler option</span>
        </Chip>
        <GhostButton onClick={onClose}>Keep this exercise</GhostButton>
      </div>
    </Sheet>
  )
}
