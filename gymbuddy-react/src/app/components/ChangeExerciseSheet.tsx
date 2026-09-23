import { useState } from 'react'
import Sheet from './Sheet'
import { PrimaryButton } from './ui'
import FormGuide from './FormGuide'
import type { Exercise } from '../../engine/types'

export default function ChangeExerciseSheet({
  open,
  candidates,
  busyStatus,
  onPick,
  onClose,
}: {
  open: boolean
  candidates: Exercise[]
  /** Optional per-exercise "usually busy/free right now" tag from the
   *  Busy-Machine Map — absent (or an id missing from it) just shows no tag. */
  busyStatus?: Record<string, 'busy' | 'free'>
  onPick: (exercise: Exercise) => void
  onClose: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleClose() {
    onClose()
    window.setTimeout(() => setExpandedId(null), 200)
  }

  return (
    <Sheet open={open} onClose={handleClose}>
      <h2 className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
        Change exercise
      </h2>
      <p className="mt-1 text-sm text-muted">Pick a replacement that works the same muscles.</p>
      <div className="mt-3 grid max-h-[55vh] gap-2 overflow-y-auto">
        {candidates.map((ex) => {
          const expanded = expandedId === ex.id
          return (
            <div key={ex.id} className="rounded-2xl border-2 border-line">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 p-3 text-left"
                onClick={() => setExpandedId(expanded ? null : ex.id)}
                aria-expanded={expanded}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                      {ex.name}
                    </div>
                    {busyStatus?.[ex.id] && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${busyStatus[ex.id] === 'busy' ? 'bg-warn/15 text-warn' : 'bg-go/15 text-go'}`}>
                        {busyStatus[ex.id] === 'busy' ? 'Often busy now' : 'Usually free now'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted">{ex.description}</div>
                </div>
                <span aria-hidden="true" className={`shrink-0 text-lg text-muted transition-transform ${expanded ? '-rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
              {expanded && (
                <div className="border-t border-line p-3">
                  <FormGuide exercise={ex} />
                  <PrimaryButton className="mt-3" onClick={() => onPick(ex)}>
                    Use this exercise
                  </PrimaryButton>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
