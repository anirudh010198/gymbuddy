import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGym } from '../../store/GymStoreContext'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { GOALS } from '../../engine/goals'
import { QUICK_SESSION_SIZE, FULL_SESSION_SIZE } from '../../engine/swap'
import { equipSectionLabel } from '../../engine/warmup'
import { reportBusyNow, forecastForSession, statusFor } from '../../engine/busyMap'
import { useBusySource } from '../../store/BusySourceContext'
import { findLastLog, formatLastTime, isPB } from '../../engine/progress'
import { ageBracketFor, restSecondsFor, restReasonNote, startWeightNote, effortStyleForAge, EFFORT_STYLES, EFFORT_LEVEL_ORDER } from '../../engine/age'
import type { Exercise, Group, Reason } from '../../engine/types'
import { Wrap, Tag, PrimaryButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import Plate from '../components/Plate'
import MuscleMap from '../components/MuscleMap'
import SwapSheet from '../components/SwapSheet'
import ChangeExerciseSheet from '../components/ChangeExerciseSheet'
import FormGuide from '../components/FormGuide'
import InfoSheet, { type SwapInfo } from '../components/InfoSheet'
import RepWeightSheet from '../components/RepWeightSheet'
import AskCoachSheet from '../components/AskCoachSheet'
import FinishSheet from '../components/FinishSheet'
import RestBar from '../components/RestBar'
import Toast from '../components/Toast'
import Warmup from './Warmup'
import { useAiAvailable } from '../lib/useAiAvailable'

function reasonLabel(r: Reason) {
  return r === 'busy' ? 'equipment busy' : r === 'unsure' ? "wasn't sure how" : 'felt uncomfortable'
}

function formatSetLabel(reps: number, weight: number | null) {
  const r = `${reps}`
  return weight != null ? `${r} × ${weight % 1 === 0 ? weight : weight.toFixed(1)}kg` : `${r} reps`
}

export default function Workout() {
  const active = useGym((s) => s.active)!
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const logSet = useGym((s) => s.logSet)
  const setSetValues = useGym((s) => s.setSetValues)
  const setEffort = useGym((s) => s.setEffort)
  const previewSwap = useGym((s) => s.previewSwap)
  const applySwap = useGym((s) => s.applySwap)
  const finishWorkout = useGym((s) => s.finishWorkout)
  const dismissWarmup = useGym((s) => s.dismissWarmup)
  const skipRest = useGym((s) => s.skipRest)
  const extendRest = useGym((s) => s.extendRest)
  const trackEvent = useGym((s) => s.trackEvent)
  const reduce = useReducedMotion()

  const busySource = useBusySource()
  // Busy-Machine Map: read once per mount — good enough for a same-session
  // forecast, and avoids re-reading localStorage on every render.
  const [busyReports] = useState(() => (profile.gymCode ? busySource.all(profile.gymCode) : []))

  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [changeExercise, setChangeExercise] = useState<{ itemIndex: number; reason: Reason; candidates: Exercise[] } | null>(null)
  const [info, setInfo] = useState<SwapInfo | null>(null)
  const [banners, setBanners] = useState<Record<number, { from: string; reason: Reason }>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ itemIndex: number; setIndex: number } | null>(null)
  const [pbDone, setPbDone] = useState<Set<number>>(new Set())
  const [pulse, setPulse] = useState<{ itemIndex: number; setIndex: number } | null>(null)
  const [askIndex, setAskIndex] = useState<number | null>(null)
  const [guideOpen, setGuideOpen] = useState<Set<number>>(new Set())
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [transitionDismissed, setTransitionDismissed] = useState<Set<number>>(new Set())
  const aiAvailable = useAiAvailable()
  const toastTimer = useRef<number | undefined>(undefined)
  const pulseTimer = useRef<number | undefined>(undefined)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  function showToast(msg: string) {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const g = GOALS[profile.goal]
  const ageBracket = ageBracketFor(profile.age)
  const restSeconds = restSecondsFor(g.rest, ageBracket)
  // Defaults from age at onboarding but always user-overridable in Settings
  // from then on — profile.effortStyle may be missing on profiles saved
  // before this existed, hence the age-derived fallback.
  const effortContent = EFFORT_STYLES[profile.effortStyle ?? effortStyleForAge(ageBracket)]
  const total = active.items.reduce((a, it) => a + it.sets.length, 0)
  const done = active.items.reduce((a, i) => a + i.sets.filter((s) => s.completedAt != null).length, 0)

  // Progress (and scroll target) is computed per item's own exercise group,
  // not the session's nominal group — a regular single-group day only ever
  // has items in one group (identical to the old behaviour), while a mixed
  // "Build my own" day gets an accurate per-region breakdown instead of
  // matching nothing.
  function itemsForGroup(group: Group) {
    return active.items.filter((it) => BY_ID[it.id].group === group)
  }

  function progressForGroup(group: Group) {
    const items = itemsForGroup(group)
    if (!items.length) return 0
    const t = items.reduce((a, it) => a + it.sets.length, 0)
    const d = items.reduce((a, it) => a + it.sets.filter((s) => s.completedAt != null).length, 0)
    return d / Math.max(1, t)
  }

  function scrollToGroup(group: Group) {
    const idx = active.items.findIndex((it) => BY_ID[it.id].group === group)
    if (idx === -1) return
    cardRefs.current[idx]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  function handleReason(reason: Reason) {
    if (swapIndex === null) return
    const ix = swapIndex
    setSwapIndex(null)
    if (reason === 'busy' && profile.gymCode) {
      const it = active.items[ix]
      reportBusyNow(busySource, profile.gymCode, it.id, BY_ID[it.id].equip)
      trackEvent('busy_reported', { ex: it.id, gym: profile.gymCode })
    }
    const candidates = previewSwap(ix, reason)
    if (!candidates.length) {
      setInfo({ type: 'exhausted' })
      return
    }
    setChangeExercise({ itemIndex: ix, reason, candidates })
  }

  function handlePick(exercise: Exercise) {
    if (!changeExercise) return
    const { itemIndex, reason } = changeExercise
    const cur = BY_ID[active.items[itemIndex].id]
    const outcome = applySwap(itemIndex, exercise.id, reason)
    setChangeExercise(null)
    if (!outcome.ok) return
    setBanners((b) => ({ ...b, [itemIndex]: { from: cur.name, reason } }))
    if (reason === 'pain') {
      setInfo({ type: 'safety', exerciseName: outcome.exercise.name })
    } else {
      showToast(`Swapped in ${outcome.exercise.name}`)
    }
  }

  function toggleGuide(ix: number) {
    setGuideOpen((prev) => {
      const next = new Set(prev)
      if (next.has(ix)) next.delete(ix)
      else next.add(ix)
      return next
    })
  }

  const swapTarget = swapIndex !== null ? BY_ID[active.items[swapIndex].id] : null
  const editingItem = editing ? active.items[editing.itemIndex] : null
  const editingExercise = editingItem ? BY_ID[editingItem.id] : null
  const editingSet = editing ? editingItem!.sets[editing.setIndex] : null

  // Where to find the exercise the current rest is counting down into — the
  // next un-logged set on the same exercise if there is one, else the name
  // of the next exercise that still has work left.
  function nextUpLabel(itemIndex: number): string | null {
    const item = active.items[itemIndex]
    if (!item) return null
    const nextSetIx = item.sets.findIndex((s) => s.completedAt == null)
    if (nextSetIx !== -1) return `Set ${nextSetIx + 1} of ${item.sets.length} — ${BY_ID[item.id].name}`
    const nextItem = active.items.find((it, i) => i > itemIndex && it.sets.some((s) => s.completedAt == null))
    return nextItem ? BY_ID[nextItem.id].name : null
  }

  // The one item, if any, that should show the "next up" transition banner
  // right now: the first exercise not yet started whose predecessor is done.
  const transitionTargetIx = active.items.findIndex((it, i) => {
    if (transitionDismissed.has(i)) return false
    if (i === 0) return false
    const notStarted = it.sets.every((s) => s.completedAt == null)
    if (!notStarted) return false
    const prev = active.items[i - 1]
    return prev.sets.every((s) => s.completedAt != null)
  })

  const sessionTarget = active.length === 'quick' ? QUICK_SESSION_SIZE : active.length === 'full' ? FULL_SESSION_SIZE : null
  const belowTarget = sessionTarget != null && active.items.length < sessionTarget

  const forecast = profile.gymCode ? forecastForSession(busyReports, active.items.map((it) => it.id)) : null

  useEffect(() => {
    if (profile.gymCode) trackEvent('forecast_shown', { gym: profile.gymCode, hasData: forecast != null })
    // Fire once per mount only — not on every busyReports/forecast recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!active.warmupShown) {
    return <Warmup group={active.group} ageBracket={ageBracket} onStart={dismissWarmup} onSkip={dismissWarmup} />
  }

  return (
    <>
      <Toast message={toast} />
      <Wrap>
        <div className="mt-2 flex items-center justify-end">
          <Tag>
            <span data-testid="sets-progress">
              {done}/{total} sets
            </span>
          </Tag>
        </div>
        <h1 className="mt-3 font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
          {active.group === 'mixed' ? 'Your workout' : `${GROUP_LABEL[active.group]} day`}
        </h1>
        <p className="text-muted">
          {active.length === 'custom' ? 'Custom' : active.length === 'quick' ? 'Quick' : 'Full'} session · Rest {restSeconds}s
          between sets. Last 2 reps should feel hard, not impossible.
        </p>
        {restReasonNote(ageBracket) && <p className="mt-1 text-sm text-muted">{restReasonNote(ageBracket)}</p>}
        {belowTarget && (
          <p className="mt-2 rounded-xl bg-soft p-3 text-sm">
            Only {active.items.length} match your equipment. Add equipment in Settings for the full {sessionTarget}-exercise session.
          </p>
        )}
        {profile.gymCode &&
          (forecast ? (
            <p className="mt-2 rounded-xl bg-soft p-3 text-sm">
              <b>Right now at {profile.gymName}:</b>{' '}
              {forecast
                .filter((f) => f.count > 0 || f.status === 'busy')
                .map((f) => `${BY_ID[f.exerciseId].name} usually ${f.status}`)
                .join(' · ') || 'not enough data on today\'s exercises yet'}
            </p>
          ) : (
            <p className="mt-2 rounded-xl bg-soft p-3 text-sm text-muted">
              Still learning {profile.gymName}'s rush hours. Every "it's busy" swap teaches it.
            </p>
          ))}
        {active.busyReorderNote && <p className="mt-2 text-sm text-muted">{active.busyReorderNote}</p>}
        <div className="mt-3">
          <ProgressBar pct={(done / total) * 100} />
        </div>
        <div className="mt-4">
          <MuscleMap
            legsProgress={progressForGroup('legs')}
            pushProgress={progressForGroup('push')}
            pullProgress={progressForGroup('pull')}
            onTap={scrollToGroup}
          />
        </div>
        <div className="mt-5 grid gap-4">
          {active.items.map((it, ix) => {
            const e = BY_ID[it.id]
            const banner = banners[ix]
            const lastLog = findLastLog(history, it.id)
            const lastTimeText = lastLog
              ? `Last time: ${formatLastTime(lastLog)}. Try to beat one set today.`
              : "First time. Find a weight that feels hard on the last 2 reps."
            const noSetsYet = it.sets.every((s) => s.completedAt == null)
            return (
              <div key={ix}>
                {ix === transitionTargetIx && (
                  <div className="mb-4 rounded-2xl border-2 border-plate/50 bg-plate/10 p-4">
                    <p className="font-semibold">
                      Exercise {ix + 1} of {active.items.length}: {e.name}. It's in {equipSectionLabel(e.equip)}.
                    </p>
                    <button
                      type="button"
                      className="mt-3 min-h-[44px] rounded-xl bg-plate px-4 font-display font-bold text-plate-ink"
                      onClick={() => {
                        setTransitionDismissed((prev) => new Set(prev).add(ix))
                        cardRefs.current[ix]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
                      }}
                    >
                      Start
                    </button>
                  </div>
                )}
              <motion.section
                ref={(el: HTMLElement | null) => {
                  cardRefs.current[ix] = el
                }}
                layout
                transition={{ duration: reduce ? 0 : 0.25, ease: 'easeInOut' }}
                aria-label={e.name}
                className="rounded-card border border-line bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Tag>
                      {ix + 1} of {active.items.length}, {GROUP_LABEL[e.group]}
                    </Tag>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.h2
                        key={e.id}
                        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.18 }}
                        className="mt-2 font-display font-bold leading-[1.05]"
                        style={{ fontSize: '1.7rem' }}
                      >
                        {e.name}
                      </motion.h2>
                    </AnimatePresence>
                    <div className="text-sm font-semibold text-muted">{e.muscles}</div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-xl border-2 border-line px-3 py-2 text-sm font-semibold"
                    onClick={() => setSwapIndex(ix)}
                  >
                    Swap
                  </button>
                </div>
                {banner && (
                  <p className="mt-2 text-sm text-go">
                    Swapped in for {banner.from} ({reasonLabel(banner.reason)}).
                  </p>
                )}
                <p className="mt-2 text-sm font-semibold text-muted">{lastTimeText}</p>
                <p className="mt-3">
                  <b>How:</b> {e.how}
                </p>
                <p className="mt-1 text-sm text-muted">
                  <b>Avoid:</b> {e.avoid} <b>Start:</b> {e.start}
                  {startWeightNote(ageBracket) && ` ${startWeightNote(ageBracket)}`}
                </p>
                {noSetsYet && (
                  <p className="mt-1 text-sm text-muted">
                    <b>Finding your weight:</b> right if the last 2 reps feel hard but your form stays clean. Too easy?
                    Go up next set. Can't finish the reps with good form? Go lighter.
                  </p>
                )}
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold underline decoration-line underline-offset-2"
                  onClick={() => toggleGuide(ix)}
                  aria-expanded={guideOpen.has(ix)}
                >
                  {guideOpen.has(ix) ? 'Hide form guide' : 'Full form guide'}
                </button>
                {guideOpen.has(ix) && (
                  <div className="mt-3 rounded-2xl bg-soft p-3">
                    <FormGuide exercise={e} />
                  </div>
                )}
                {aiAvailable && (
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold underline decoration-line underline-offset-2"
                    onClick={() => setAskIndex(ix)}
                  >
                    Ask GymBuddy
                  </button>
                )}
                <div className="mt-4 flex gap-4" role="group" aria-label="Log sets">
                  {it.sets.map((s, si) => (
                    <div key={si} className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <Plate
                          index={si}
                          done={s.completedAt != null}
                          effortEmoji={it.effort ? effortContent[it.effort].emoji : undefined}
                          onToggle={() => {
                            const turningOn = s.completedAt == null
                            if (turningOn) {
                              const wouldBePB = isPB(history, it.id, { ...s, completedAt: Date.now() })
                              if (wouldBePB && !pbDone.has(ix)) {
                                setPbDone((prev) => new Set(prev).add(ix))
                                setPulse({ itemIndex: ix, setIndex: si })
                                window.clearTimeout(pulseTimer.current)
                                pulseTimer.current = window.setTimeout(() => setPulse(null), 650)
                                showToast('New best!')
                              } else {
                                showToast(`Set ${si + 1} logged. Rest ${restSeconds}s.`)
                              }
                            }
                            logSet(ix, si)
                          }}
                        />
                        <AnimatePresence>
                          {!reduce && pulse?.itemIndex === ix && pulse?.setIndex === si && (
                            <motion.span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 rounded-full"
                              style={{ boxShadow: '0 0 0 4px var(--plate)' }}
                              initial={{ opacity: 0.9, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.6 }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted underline decoration-line underline-offset-2"
                        onClick={() => setEditing({ itemIndex: ix, setIndex: si })}
                      >
                        {formatSetLabel(s.reps, s.weight)}
                      </button>
                    </div>
                  ))}
                </div>
                {it.sets.some((s) => s.completedAt != null) && (
                  <div className="mt-4" role="group" aria-label="Effort for this exercise">
                    <div className="text-sm font-semibold text-muted">How did that feel?</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {EFFORT_LEVEL_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={it.effort === key}
                          onClick={() => setEffort(ix, key)}
                          className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${
                            it.effort === key ? 'border-plate bg-plate/20' : 'border-line'
                          }`}
                        >
                          {effortContent[key].emoji} {effortContent[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {it.tipShown && profile.goal === 'muscle' && (
                  <motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    transition={{ duration: reduce ? 0 : 0.25 }}
                    className="mt-4 overflow-hidden rounded-2xl border border-plate/40 bg-plate/10 p-3"
                  >
                    <div className="text-sm font-bold text-plate-ink">Bonus tip unlocked</div>
                    <p className="mt-1 text-sm">{e.bonusTip}</p>
                  </motion.div>
                )}
                {active.restForItemIndex === ix && active.restUntil != null && (
                  <RestBar restUntil={active.restUntil} nextLabel={nextUpLabel(ix)} onSkip={skipRest} onExtend={extendRest} />
                )}
              </motion.section>
              </div>
            )
          })}
        </div>
      </Wrap>
      <Dock raised>
        <PrimaryButton disabled={done === 0} onClick={() => setConfirmFinish(true)}>
          {done === total ? 'Finish workout' : done ? `Finish with ${done}/${total} sets` : 'Log a set to finish'}
        </PrimaryButton>
      </Dock>
      <FinishSheet
        open={confirmFinish}
        done={done}
        total={total}
        onConfirm={() => {
          setConfirmFinish(false)
          finishWorkout()
        }}
        onClose={() => setConfirmFinish(false)}
      />
      <SwapSheet
        open={swapIndex !== null}
        exerciseName={swapTarget?.name ?? ''}
        onReason={handleReason}
        onClose={() => setSwapIndex(null)}
      />
      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <RepWeightSheet
        open={editing !== null}
        exercise={editingExercise}
        reps={editingSet?.reps ?? 0}
        weight={editingSet?.weight ?? null}
        onChange={(patch) => editing && setSetValues(editing.itemIndex, editing.setIndex, patch)}
        onClose={() => setEditing(null)}
      />
      <AskCoachSheet
        open={askIndex !== null}
        exercise={askIndex !== null ? BY_ID[active.items[askIndex].id] : null}
        goal={profile.goal}
        onClose={() => setAskIndex(null)}
      />
      <ChangeExerciseSheet
        open={changeExercise !== null}
        candidates={changeExercise?.candidates ?? []}
        busyStatus={
          profile.gymCode
            ? Object.fromEntries(
                (changeExercise?.candidates ?? [])
                  .map((ex) => [ex.id, statusFor(busyReports, ex.id)] as const)
                  .filter((entry): entry is [string, 'busy' | 'free'] => entry[1] != null),
              )
            : undefined
        }
        onPick={handlePick}
        onClose={() => setChangeExercise(null)}
      />
    </>
  )
}
