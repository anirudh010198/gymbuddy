import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGymStore } from '../../store/useGymStore'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { GOALS, SETS } from '../../engine/goals'
import { findLastLog, formatLastTime, isPB } from '../../engine/progress'
import type { Group, Reason } from '../../engine/types'
import { Wrap, Tag, PrimaryButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import Plate from '../components/Plate'
import MuscleMap from '../components/MuscleMap'
import SwapSheet from '../components/SwapSheet'
import InfoSheet, { type SwapInfo } from '../components/InfoSheet'
import RepWeightSheet from '../components/RepWeightSheet'
import Toast from '../components/Toast'

function reasonLabel(r: Reason) {
  return r === 'busy' ? 'equipment busy' : r === 'unsure' ? "wasn't sure how" : 'felt uncomfortable'
}

function formatSetLabel(reps: number, weight: number | null) {
  const r = `${reps}`
  return weight != null ? `${r} × ${weight % 1 === 0 ? weight : weight.toFixed(1)}kg` : `${r} reps`
}

export default function Workout() {
  const active = useGymStore((s) => s.active)!
  const profile = useGymStore((s) => s.profile)!
  const history = useGymStore((s) => s.history)
  const logSet = useGymStore((s) => s.logSet)
  const setSetValues = useGymStore((s) => s.setSetValues)
  const requestSwap = useGymStore((s) => s.requestSwap)
  const finishWorkout = useGymStore((s) => s.finishWorkout)
  const setPeekHome = useGymStore((s) => s.setPeekHome)
  const reduce = useReducedMotion()

  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [info, setInfo] = useState<SwapInfo | null>(null)
  const [banners, setBanners] = useState<Record<number, { from: string; reason: Reason }>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ itemIndex: number; setIndex: number } | null>(null)
  const [pbDone, setPbDone] = useState<Set<number>>(new Set())
  const [pulse, setPulse] = useState<{ itemIndex: number; setIndex: number } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const pulseTimer = useRef<number | undefined>(undefined)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  function showToast(msg: string) {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const g = GOALS[profile.goal]
  const total = active.items.length * SETS
  const done = active.items.reduce((a, i) => a + i.sets.filter((s) => s.completedAt != null).length, 0)

  function indexForGroup(group: Group) {
    return active.items.findIndex((it) => BY_ID[it.id].group === group)
  }

  function progressForGroup(group: Group) {
    const ix = indexForGroup(group)
    if (ix === -1) return 0
    const item = active.items[ix]
    return item.sets.filter((s) => s.completedAt != null).length / item.sets.length
  }

  function scrollToGroup(group: Group) {
    const ix = indexForGroup(group)
    cardRefs.current[ix]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  function handleReason(reason: Reason) {
    if (swapIndex === null) return
    const ix = swapIndex
    const cur = BY_ID[active.items[ix].id]
    setSwapIndex(null)
    const outcome = requestSwap(ix, reason)
    if (!outcome.ok) {
      setInfo({ type: 'exhausted' })
      return
    }
    setBanners((b) => ({ ...b, [ix]: { from: cur.name, reason } }))
    if (reason === 'pain') {
      setInfo({ type: 'safety', exerciseName: outcome.exercise.name })
    } else {
      showToast(`Swapped in ${outcome.exercise.name}`)
    }
  }

  const swapTarget = swapIndex !== null ? BY_ID[active.items[swapIndex].id] : null
  const editingItem = editing ? active.items[editing.itemIndex] : null
  const editingExercise = editingItem ? BY_ID[editingItem.id] : null
  const editingSet = editing ? editingItem!.sets[editing.setIndex] : null

  return (
    <>
      <Toast message={toast} />
      <Wrap>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" className="font-semibold text-muted" onClick={() => setPeekHome(true)}>
            Home
          </button>
          <Tag>
            {done}/{total} sets
          </Tag>
        </div>
        <h1 className="mt-3 font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
          Workout {active.dayIndex % 2 ? 'B' : 'A'}
        </h1>
        <p className="text-muted">
          {SETS} sets × {g.reps} reps. Rest {g.rest}s between sets. Last 2 reps should feel hard, not impossible.
        </p>
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
            return (
              <motion.section
                key={ix}
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
                </p>
                <div className="mt-4 flex gap-4" role="group" aria-label="Log sets">
                  {it.sets.map((s, si) => (
                    <div key={si} className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <Plate
                          index={si}
                          done={s.completedAt != null}
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
                                showToast(`Set ${si + 1} logged. Rest ${g.rest}s.`)
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
              </motion.section>
            )
          })}
        </div>
      </Wrap>
      <Dock>
        <PrimaryButton disabled={done === 0} onClick={finishWorkout}>
          {done === total ? 'Finish workout' : done ? `Finish with ${done}/${total} sets` : 'Log a set to finish'}
        </PrimaryButton>
      </Dock>
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
    </>
  )
}
