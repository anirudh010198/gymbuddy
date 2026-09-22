import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGymStore } from '../../store/useGymStore'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { GOALS, SETS } from '../../engine/goals'
import type { Reason } from '../../engine/types'
import { Wrap, Tag, PrimaryButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import Plate from '../components/Plate'
import SwapSheet from '../components/SwapSheet'
import InfoSheet, { type SwapInfo } from '../components/InfoSheet'
import Toast from '../components/Toast'

function reasonLabel(r: Reason) {
  return r === 'busy' ? 'equipment busy' : r === 'unsure' ? "wasn't sure how" : 'felt uncomfortable'
}

export default function Workout() {
  const active = useGymStore((s) => s.active)!
  const profile = useGymStore((s) => s.profile)!
  const toggleSet = useGymStore((s) => s.toggleSet)
  const requestSwap = useGymStore((s) => s.requestSwap)
  const finishWorkout = useGymStore((s) => s.finishWorkout)
  const setPeekHome = useGymStore((s) => s.setPeekHome)
  const reduce = useReducedMotion()

  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [info, setInfo] = useState<SwapInfo | null>(null)
  const [banners, setBanners] = useState<Record<number, { from: string; reason: Reason }>>({})
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  function showToast(msg: string) {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const g = GOALS[profile.goal]
  const total = active.items.length * SETS
  const done = active.items.reduce((a, i) => a + i.done.filter(Boolean).length, 0)

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
        <div className="mt-5 grid gap-4">
          {active.items.map((it, ix) => {
            const e = BY_ID[it.id]
            const banner = banners[ix]
            return (
              <motion.section
                key={ix}
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
                <p className="mt-3">
                  <b>How:</b> {e.how}
                </p>
                <p className="mt-1 text-sm text-muted">
                  <b>Avoid:</b> {e.avoid} <b>Start:</b> {e.start}
                </p>
                <div className="mt-4 flex gap-3" role="group" aria-label="Log sets">
                  {it.done.map((d, si) => (
                    <Plate
                      key={si}
                      index={si}
                      done={d}
                      onToggle={() => {
                        const turningOn = !it.done[si]
                        toggleSet(ix, si)
                        if (turningOn) showToast(`Set ${si + 1} logged. Rest ${g.rest}s.`)
                      }}
                    />
                  ))}
                </div>
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
    </>
  )
}
