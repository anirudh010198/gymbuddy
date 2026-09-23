import { useEffect, useState } from 'react'
import { useGym } from '../../store/GymStoreContext'
import { streakWeeks, weekCount } from '../../engine/streak'
import { today, weekStart } from '../../engine/dates'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { buildGroupWorkout, suggestNextGroup } from '../../engine/swap'
import { compareToLast, exerciseHasPB, findLastLog, totalReps } from '../../engine/progress'
import { Wrap, Card, Chip, PrimaryButton, GhostButton, Dock } from '../components/ui'
import WeekDots from '../components/WeekDots'
import InfoSheet, { type SwapInfo } from '../components/InfoSheet'
import ProfileCaptureCard from '../components/ProfileCaptureCard'
import { buildShareImage } from '../lib/shareCard'
import { isProfileCaptureDismissed } from '../lib/contactProfile'

const FEELS = ['Too easy', 'About right', 'Too hard'] as const

export default function Summary() {
  const history = useGym((s) => s.history)
  const profile = useGym((s) => s.profile)!
  const setFeel = useGym((s) => s.setFeel)
  const dismissSummary = useGym((s) => s.dismissSummary)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [preview, setPreview] = useState<SwapInfo | null>(null)
  const [canShare, setCanShare] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [profileCaptureDone, setProfileCaptureDone] = useState(() => isProfileCaptureDismissed())

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const last = history[history.length - 1]
  const priorHistory = history.slice(0, -1)
  const wc = weekCount(history, weekStart(today()))
  const target = profile.target
  const st = streakWeeks(history, target)

  if (!last) return null

  const msg = wc >= target ? "Weekly target hit. That's the whole game in month one." : `${target - wc} more this week to keep your streak.`
  const tips = last.tipsUnlocked ?? []

  // finishWorkout already updated profile.lastGroup to the group just
  // trained, so this is genuinely the suggestion for the *next* session.
  const nextGroup = suggestNextGroup(profile.lastGroup)
  const nextExercises = buildGroupWorkout(nextGroup, 'quick', profile.equip).map((p) => BY_ID[p.id])

  async function handleShare() {
    setSharing(true)
    try {
      const blob = await buildShareImage({ workoutNumber: history.length, reps: last.reps, volume: last.volume, streak: st })
      if (!blob) return
      const file = new File([blob], 'gymbuddy-workout.png', { type: 'image/png' })
      if (navigator.canShare && !navigator.canShare({ files: [file] })) return
      await navigator.share({ files: [file], title: 'GymBuddy' })
    } catch {
      /* share sheet dismissed or unavailable mid-flow — not an error */
    } finally {
      setSharing(false)
    }
  }

  return (
    <Wrap>
      <div className="mt-8 font-display font-extrabold text-go" style={{ fontSize: '1.3rem' }}>
        Workout {history.length} complete
      </div>
      <div className="font-display font-extrabold leading-[0.95]" style={{ fontSize: '3.6rem' }}>
        You showed up.
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            {last.reps}
          </div>
          <div className="text-sm text-muted">reps</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            {last.volume.toLocaleString()}
          </div>
          <div className="text-sm text-muted">kg lifted</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            {last.mins}
          </div>
          <div className="text-sm text-muted">min</div>
        </Card>
      </div>

      <Card className="mt-4 divide-y divide-line p-0">
        {last.items.map((it, ix) => {
          const e = BY_ID[it.id]
          const groupReps = totalReps(it.log)
          const isPB = exerciseHasPB(priorHistory, it.id, it.log)
          const cmp = compareToLast(it.log, findLastLog(priorHistory, it.id))
          const repsSeq = it.log
            .filter((s) => s.completedAt != null)
            .map((s) => s.reps ?? '–')
            .join('·')
          const weight = it.log.find((s) => s.completedAt != null && s.weight != null)?.weight
          return (
            <div key={ix} className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">{GROUP_LABEL[e.group]}</span>
                <span className="text-xs font-semibold text-muted">{groupReps} reps</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-display font-bold" style={{ fontSize: '1.15rem' }}>
                  {e.name} <span className="font-sans text-sm font-normal text-muted">{repsSeq}{weight != null ? ` @ ${weight}kg` : ''}</span>
                </span>
                {isPB ? (
                  <span className="shrink-0 rounded-full bg-plate px-2 py-0.5 text-xs font-bold text-plate-ink">★ PB</span>
                ) : (
                  <span className="shrink-0 text-sm font-semibold text-muted">
                    {cmp.arrow === 'up' ? '▲ ' : cmp.arrow === 'down' ? '▼ ' : ''}
                    {cmp.label}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </Card>

      {tips.length > 0 && (
        <Card className="mt-4 p-4">
          <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setTipsOpen((v) => !v)}>
            <span className="font-display font-bold" style={{ fontSize: '1.15rem' }}>
              Tips unlocked today: {tips.length}
            </span>
            <span className="text-sm font-semibold text-muted">{tipsOpen ? 'Hide' : 'Show'}</span>
          </button>
          {tipsOpen && (
            <ul className="mt-3 grid gap-2">
              {tips.map((tip, i) => (
                <li key={i} className="rounded-xl bg-plate/10 p-3 text-sm">
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {history.length === 1 && !profileCaptureDone && (
        <ProfileCaptureCard defaultAge={profile.age} onDone={() => setProfileCaptureDone(true)} />
      )}

      <Card className="mt-4 p-4">
        <div className="text-sm font-semibold text-muted">Next time: {GROUP_LABEL[nextGroup]} suggested</div>
        <p className="mt-1">
          {nextExercises.map((ex, i) => (
            <span key={ex.id}>
              <button type="button" className="font-semibold underline decoration-line underline-offset-2" onClick={() => setPreview({ type: 'preview', exercise: ex })}>
                {ex.name}
              </button>
              {i < nextExercises.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </Card>

      {canShare && (
        <GhostButton className="mt-4" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Preparing…' : 'Share my workout'}
        </GhostButton>
      )}

      <p className="mt-4 font-semibold">
        {wc}/{target} this week · {st} week streak
      </p>
      <p className="text-sm text-muted">{msg}</p>
      <Card className="mt-4 p-4">
        <WeekDots history={history} />
      </Card>
      <Card className="mt-4 p-4">
        <div className="font-display font-bold" style={{ fontSize: '1.3rem' }}>
          How did today feel?
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FEELS.map((f) => (
            <Chip key={f} pressed={last.feel === f} className="text-center font-semibold" onClick={() => setFeel(f)}>
              {f}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          Next time we'll{' '}
          {last.feel === 'Too easy'
            ? 'suggest adding a little weight'
            : last.feel === 'Too hard'
              ? 'suggest lighter weight or fewer reps'
              : 'keep the same targets'}
          .
        </p>
      </Card>
      <Dock>
        <PrimaryButton onClick={dismissSummary}>Done</PrimaryButton>
      </Dock>
      <InfoSheet info={preview} onClose={() => setPreview(null)} />
    </Wrap>
  )
}
