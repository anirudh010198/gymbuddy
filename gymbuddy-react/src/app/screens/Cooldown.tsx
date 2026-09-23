import { useGym } from '../../store/GymStoreContext'
import { COOLDOWN_CONTENT } from '../../engine/warmup'
import { GROUP_LABEL } from '../../engine/templates'
import { Wrap, PrimaryButton, GhostButton } from '../components/ui'

/** Shown right after "Finish workout" is confirmed, before Summary — gated
 *  by cooldownPending in the store (set true by finishWorkout, cleared by
 *  dismissCooldown). Always skippable: both buttons do the same thing. */
export default function Cooldown() {
  const active = useGym((s) => s.active)
  const dismissCooldown = useGym((s) => s.dismissCooldown)
  const group = active?.group ?? 'mixed'
  const stretches = COOLDOWN_CONTENT[group]

  return (
    <Wrap>
      <h1 className="mt-3 font-display font-extrabold leading-none" style={{ fontSize: '2.2rem' }}>
        Nice work.
      </h1>
      <p className="mt-2 text-muted">
        A quick cool-down for {group === 'mixed' ? 'today' : GROUP_LABEL[group].toLowerCase()} — 30 seconds each, totally optional.
      </p>
      <ol className="mt-5 grid gap-3">
        {stretches.map((m, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plate font-display font-bold text-plate-ink">
              {i + 1}
            </span>
            <span className="mt-0.5">{m.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-3">
        <PrimaryButton onClick={dismissCooldown}>Done — see summary</PrimaryButton>
        <GhostButton onClick={dismissCooldown}>Skip cool-down</GhostButton>
      </div>
    </Wrap>
  )
}
