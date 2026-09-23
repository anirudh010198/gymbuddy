import { useEffect, useState } from 'react'
import { useGym } from '../../store/GymStoreContext'
import { useBuddySource } from '../../store/BuddySourceContext'
import { streakWeeks, weekCount } from '../../engine/streak'
import { today, weekStart } from '../../engine/dates'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { buildGroupWorkout, suggestNextGroup } from '../../engine/swap'
import { compareToLast, exerciseHasPB, findLastLog, totalReps } from '../../engine/progress'
import { canNudgeToday } from '../../engine/buddy'
import { musclesForGroups, muscleSummaryLine } from '../../engine/muscleMap'
import { Wrap, Card, Chip, PrimaryButton, GhostButton, GhostLink, Dock } from '../components/ui'
import WeekDots from '../components/WeekDots'
import SessionMuscleMap from '../components/SessionMuscleMap'
import InfoSheet, { type SwapInfo } from '../components/InfoSheet'
import ProfileCaptureCard from '../components/ProfileCaptureCard'
import { buildShareImage } from '../lib/shareCard'
import { DEFAULT_BODYWEIGHT_KG } from '../../engine/progress'
import { isProfileCaptureDismissed } from '../lib/contactProfile'
import { nudgeBuddy } from '../lib/buddyActions'

const FEELS = ['Too easy', 'About right', 'Too hard'] as const

export default function Summary() {
  const history = useGym((s) => s.history)
  const profile = useGym((s) => s.profile)!
  const setFeel = useGym((s) => s.setFeel)
  const dismissSummary = useGym((s) => s.dismissSummary)
  const trackEvent = useGym((s) => s.trackEvent)
  const buddySource = useBuddySource()
  const [tipsOpen, setTipsOpen] = useState(false)
  const [preview, setPreview] = useState<SwapInfo | null>(null)
  const [canShare, setCanShare] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [profileCaptureDone, setProfileCaptureDone] = useState(() => isProfileCaptureDismissed())
  const [buddy, setBuddy] = useState(() => buddySource.getBuddy())
  const [nudging, setNudging] = useState(false)
  const [nudged, setNudged] = useState(false)

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

  // Same "what did this session actually train" logic as the workout screen
  // — real groups from the exercises trained, never a guess. A mixed/absent
  // group (old history predating single-group days, or a "Build my own"
  // session) falls back to each item's own exercise group.
  const summaryGroups =
    last.group && last.group !== 'mixed' ? [last.group] : [...new Set(last.items.map((it) => BY_ID[it.id].group))]
  const summaryMuscles = musclesForGroups(summaryGroups)
  const plannedSets = last.items.reduce((a, it) => a + it.log.length, 0)
  const summaryProgress = plannedSets ? last.sets / plannedSets : 1
  const bodyweightKg = profile.bodyweightKg ?? DEFAULT_BODYWEIGHT_KG
  const busySwaps = last.items.reduce((sum, item) => sum + item.swaps.filter((swap) => swap.reason === 'busy').length, 0)
  const estimatedMinutesSaved = busySwaps * 5
  const effortKeys = ['casual', 'sigma', 'god', 'aura'] as const
  const effortNames = ['Casual', 'Sigma', 'God Mode', 'Aura']
  const effortColors = ['var(--muted)', 'var(--go)', 'var(--plate)', 'var(--warn)']
  const effortCounts = effortKeys.map((key) => last.items.filter((item) => item.effort === key).length)
  const effortTotal = effortCounts.reduce((sum, count) => sum + count, 0)
  const effortSegments = effortTotal
    ? effortCounts.reduce<{ css: string; end: number }[]>((segments, count, index) => {
        if (!count) return segments
        const start = segments.at(-1)?.end ?? 0
        const end = start + (count / effortTotal) * 360
        segments.push({ css: `${effortColors[index]} ${start}deg ${end}deg`, end })
        return segments
      }, [])
    : []
  const effortRing = effortSegments.length ? `conic-gradient(${effortSegments.map((segment) => segment.css).join(', ')})` : 'var(--line)'
  const personalLoadEquivalents = last.volume / bodyweightKg
  const personalBests = last.items.filter((item) => exerciseHasPB(priorHistory, item.id, item.log)).map((item) => BY_ID[item.id].name)

  // finishWorkout already updated profile.lastGroup to the group just
  // trained, so this is genuinely the suggestion for the *next* session.
  const nextGroup = suggestNextGroup(profile.lastGroup)
  const nextExercises = buildGroupWorkout(nextGroup, 'quick', profile.equip).map((p) => BY_ID[p.id])

  async function handleNudge() {
    if (!buddy) return
    setNudging(true)
    await nudgeBuddy(buddySource, buddy, trackEvent)
    setBuddy(buddySource.getBuddy())
    setNudging(false)
    setNudged(true)
  }

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
      <div className="mt-4">
        <SessionMuscleMap muscles={summaryMuscles} progress={summaryProgress} />
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-muted">{muscleSummaryLine(summaryGroups, true)}</p>
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

      <Card className="mt-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-display font-extrabold" style={{ fontSize: '1.6rem' }}>≈{personalLoadEquivalents.toFixed(1)}×</div>
            <div className="text-sm text-muted">your bodyweight moved</div>
            <div className="mt-1 text-xs text-muted">A personal scale comparison, using {bodyweightKg} kg.</div>
          </div>
          <div>
            <div className="font-display font-extrabold" style={{ fontSize: '1.6rem' }}>{estimatedMinutesSaved} min</div>
            <div className="text-sm text-muted">estimated queue time avoided</div>
            <div className="mt-1 text-xs text-muted">{busySwaps} busy-machine swaps × 5 min estimate.</div>
          </div>
        </div>
      </Card>

      <Card className="mt-4 flex items-center gap-4 p-4">
        <div
          role="img"
          aria-label={effortTotal ? `Effort ring: ${effortNames.map((name, i) => `${name} ${effortCounts[i]}`).join(', ')}` : 'No effort ratings logged'}
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full p-2"
          style={{ background: effortRing }}
        >
          <div className="grid h-full w-full place-items-center rounded-full bg-card text-center">
            <span className="px-1 text-xs font-bold text-muted">{effortTotal ? `${effortTotal} rated` : 'No ratings'}</span>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold" style={{ fontSize: '1.2rem' }}>Effort mix</h2>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {effortKeys.map((key, index) => (
              <div key={key} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: effortColors[index] }} />
                <span>{effortNames[index]} · {effortCounts[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="font-display font-bold" style={{ fontSize: '1.2rem' }}>Personal bests</h2>
        {personalBests.length ? (
          <ul className="mt-2 grid gap-1 text-sm">{personalBests.map((name) => <li key={name}>★ {name}</li>)}</ul>
        ) : <p className="mt-1 text-sm text-muted">Keep logging to spot your next PB.</p>}
      </Card>

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
          const setDetails = it.log
            .filter((s) => s.completedAt != null)
            .map((s) => `${s.reps ?? '–'}×${e.equip === 'bodyweight' ? 'bodyweight' : `${s.weight ?? '–'}kg`}`)
            .join(' · ')
          return (
            <div key={ix} className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">{GROUP_LABEL[e.group]}</span>
                <span className="text-xs font-semibold text-muted">{groupReps} reps</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-display font-bold" style={{ fontSize: '1.15rem' }}>
                  {e.name}
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
              <div className="mt-1 text-sm text-muted">{setDetails || `${repsSeq} reps`}</div>
            </div>
          )
        })}
      </Card>

      {buddy && (
        <Card className="mt-4 p-4">
          <p className="text-sm text-muted">Keep {buddy.name} going too.</p>
          <GhostButton className="mt-2" disabled={!canNudgeToday(buddy) || nudging} onClick={handleNudge}>
            {nudged ? 'Nudge sent!' : nudging ? 'Sending…' : !canNudgeToday(buddy) ? 'Already nudged today' : `Nudge ${buddy.name}`}
          </GhostButton>
        </Card>
      )}

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
      <Dock raised>
        <div className="grid grid-cols-2 gap-2">
          <GhostLink to="/">Back to home page</GhostLink>
          <PrimaryButton onClick={dismissSummary}>Done</PrimaryButton>
        </div>
      </Dock>
      <InfoSheet info={preview} onClose={() => setPreview(null)} />
    </Wrap>
  )
}
