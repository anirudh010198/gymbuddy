import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BY_ID } from '../../engine/exercises'
import { swapCandidate } from '../../engine/swap'
import type { Equip, Reason, WorkoutItem } from '../../engine/types'

// A gym with everything, so the demo always has real candidates to pick from.
const DEMO_EQUIP: Equip[] = ['machine', 'dumbbell', 'cable', 'barbell']
const START_ID = 'leg_press'

const REASONS: { key: Reason; label: string; sub: string }[] = [
  { key: 'busy', label: "It's busy or not here", sub: 'Get an option on different equipment' },
  { key: 'unsure', label: "I don't know how to do it", sub: 'Get the simplest version' },
  { key: 'pain', label: 'It hurts or feels wrong', sub: 'Get a gentler option' },
]

function reasonLabel(r: Reason) {
  return r === 'busy' ? 'equipment busy' : r === 'unsure' ? "wasn't sure how" : 'felt uncomfortable'
}

/** The single interactive moment on the landing page. Small and self-contained —
 *  no store, just the real swapCandidate engine function so the result is
 *  authentic, not a canned animation. */
export default function SwapDemo() {
  const [item, setItem] = useState<WorkoutItem>({ pattern: 'squat', id: START_ID, swaps: [] })
  const [picking, setPicking] = useState(false)
  const [lastReason, setLastReason] = useState<Reason | null>(null)
  const reduce = useReducedMotion()

  const exercise = BY_ID[item.id]

  function pick(reason: Reason) {
    const next = swapCandidate(item, reason, DEMO_EQUIP)
    setPicking(false)
    if (!next) return
    setItem((prev) => ({ ...prev, id: next.id, swaps: [...prev.swaps, { from: prev.id, to: next.id, reason }] }))
    setLastReason(reason)
  }

  function reset() {
    setItem({ pattern: 'squat', id: START_ID, swaps: [] })
    setLastReason(null)
    setPicking(false)
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-card border border-line bg-card p-5">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
            {exercise.name}
          </div>
          <div className="text-sm text-muted">{exercise.muscles}</div>
        </motion.div>
      </AnimatePresence>

      {lastReason && <p className="mt-2 text-sm text-go">Swapped in ({reasonLabel(lastReason)}).</p>}

      {!picking ? (
        <div className="mt-4 flex items-center gap-3">
          <button type="button" className="rounded-xl border-2 border-line px-4 py-2 text-sm font-semibold" onClick={() => setPicking(true)}>
            Swap
          </button>
          {item.swaps.length > 0 && (
            <button type="button" className="text-sm font-semibold text-muted underline" onClick={reset}>
              Reset demo
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {REASONS.map((r) => (
            <button key={r.key} type="button" className="rounded-xl border-2 border-line bg-card p-3 text-left" onClick={() => pick(r.key)}>
              <div className="font-display font-bold" style={{ fontSize: '1rem' }}>
                {r.label}
              </div>
              <div className="text-xs text-muted">{r.sub}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
