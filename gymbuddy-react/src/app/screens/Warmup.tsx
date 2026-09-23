import { WARMUP_CONTENT } from '../../engine/warmup'
import type { AgeBracket, Group } from '../../engine/types'
import { Wrap, PrimaryButton, GhostButton } from '../components/ui'

/** Full-screen interstitial shown once before the first exercise of a
 *  session (gated by active.warmupShown in the store — see Workout.tsx).
 *  Never blocks: "Skip warm-up" is always right there next to "Start
 *  workout", same size, same prominence. */
export default function Warmup({
  group,
  ageBracket,
  onStart,
  onSkip,
}: {
  group: Group | 'mixed'
  ageBracket: AgeBracket | null
  onStart: () => void
  onSkip: () => void
}) {
  const moves = WARMUP_CONTENT[group]
  const strongerPrompt = ageBracket === '30to40' || ageBracket === '40plus'
  return (
    <Wrap>
      <h1 className="mt-3 font-display font-extrabold leading-none" style={{ fontSize: '2.2rem' }}>
        Warm up first
      </h1>
      <p className="mt-2 text-muted">3-5 minutes before your first exercise. It lowers injury risk and the first set feels easier.</p>
      {strongerPrompt && (
        <p className="mt-2 rounded-xl bg-soft p-3 text-sm">
          <b>Worth the full 5 minutes</b> — it matters more as recovery slows down. You can still skip it if you're short on time.
        </p>
      )}
      <ol className="mt-5 grid gap-3">
        {moves.map((m, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plate font-display font-bold text-plate-ink">
              {i + 1}
            </span>
            <span className="mt-0.5">{m.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-3">
        <PrimaryButton onClick={onStart}>Done warming up</PrimaryButton>
        <GhostButton onClick={onSkip}>Skip warm-up</GhostButton>
      </div>
    </Wrap>
  )
}
