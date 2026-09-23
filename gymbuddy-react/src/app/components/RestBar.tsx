import { useEffect, useState } from 'react'

/** Unobtrusive countdown shown under the card whose set was just logged.
 *  restUntil is a plain epoch timestamp (not a running timer) so it resumes
 *  correctly for free after a reload/reopen — see store/useGymStore.ts. */
export default function RestBar({
  restUntil,
  nextLabel,
  onSkip,
  onExtend,
}: {
  restUntil: number
  nextLabel: string | null
  onSkip: () => void
  onExtend: (seconds: number) => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (restUntil <= now) onSkip()
    // Only re-check when the timer itself changes or ticks — onSkip is
    // stable (a zustand action), including it would just be noise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restUntil, now])

  const secondsLeft = Math.max(0, Math.ceil((restUntil - now) / 1000))
  if (secondsLeft <= 0) return null

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-soft p-3" role="status">
      <div>
        <div className="font-display text-2xl font-bold tabular-nums">Rest · {secondsLeft}s</div>
        {nextLabel && <div className="text-sm text-muted">Next: {nextLabel}</div>}
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" className="rounded-xl border-2 border-line px-3 py-2 text-sm font-semibold" onClick={() => onExtend(30)}>
          +30s
        </button>
        <button type="button" className="rounded-xl border-2 border-line px-3 py-2 text-sm font-semibold" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  )
}
