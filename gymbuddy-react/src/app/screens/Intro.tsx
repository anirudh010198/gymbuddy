import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from 'framer-motion'
import { useGym } from '../../store/GymStoreContext'
import { Wrap, PrimaryButton } from '../components/ui'

function PlanIllustration() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="120" aria-hidden="true">
      <rect x="30" y="10" width="100" height="100" rx="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="52" cy="34" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="text-plate" />
      <circle cx="52" cy="34" r="3" fill="none" stroke="currentColor" strokeWidth="3" className="text-plate" />
      <rect x="70" y="28" width="46" height="10" rx="5" className="fill-line" />
      <circle cx="52" cy="64" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="text-plate" />
      <circle cx="52" cy="64" r="3" fill="none" stroke="currentColor" strokeWidth="3" className="text-plate" />
      <rect x="70" y="58" width="46" height="10" rx="5" className="fill-line" />
      <circle cx="52" cy="94" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <rect x="70" y="88" width="30" height="10" rx="5" className="fill-line" />
    </svg>
  )
}

function SwapIllustration() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="120" aria-hidden="true">
      <circle cx="46" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="46" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="114" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-plate" />
      <circle cx="114" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="4" className="text-plate" />
      <path
        d="M74 44 A 26 26 0 0 1 86 36 M86 76 A 26 26 0 0 1 74 68"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-go"
      />
      <path d="M86 30 L92 37 L84 40 Z" className="fill-go" />
      <path d="M74 74 L68 67 L76 64 Z" className="fill-go" />
    </svg>
  )
}

function RadarIllustration() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="120" aria-hidden="true">
      <circle cx="80" cy="60" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="80" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="80" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="80" cy="60" r="4" className="fill-plate" />
      <circle cx="98" cy="42" r="6" className="fill-go" />
      <circle cx="58" cy="78" r="6" className="fill-warn" />
    </svg>
  )
}

const CARDS = [
  {
    Illustration: PlanIllustration,
    title: 'Never wonder what to do at the gym.',
    body: "We give you 4-6 exercises for today, with exactly how to do each one.",
  },
  {
    Illustration: SwapIllustration,
    title: 'Machine busy? Tap once.',
    body: 'Get a different exercise for the same muscles, instantly — no scrolling through a library.',
  },
  {
    Illustration: RadarIllustration,
    title: 'Rush Radar knows your gym.',
    body: 'See which machines are usually free right now, before you even walk in.',
  },
]

/** The one-time "what is GymBuddy" explainer — see introPending in
 *  useGymStore and lib/introSeen.ts. Shown before onboarding for a
 *  brand-new device, or any time from Settings' "Show intro again". */
export default function Intro() {
  const dismissIntro = useGym((s) => s.dismissIntro)
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const last = index === CARDS.length - 1
  const { Illustration, title, body } = CARDS[index]

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && !last) setIndex((i) => i + 1)
    else if (info.offset.x > 60 && index > 0) setIndex((i) => i - 1)
  }

  return (
    <Wrap>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-plate">
          <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="5" />
            <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="5" />
          </svg>
        </div>
        <button type="button" onClick={dismissIntro} className="text-sm font-semibold text-muted hover:text-ink">
          Skip
        </button>
      </div>

      <div className="mt-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            drag={reduce ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: reduce ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -24 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="rounded-card border border-line bg-card p-6 text-center"
          >
            <Illustration />
            <h1 className="mt-6 font-display font-extrabold leading-tight" style={{ fontSize: '1.7rem' }}>
              {title}
            </h1>
            <p className="mt-3 text-muted">{body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Intro cards">
        {CARDS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Card ${i + 1} of ${CARDS.length}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-plate' : 'w-2 bg-line'}`}
          />
        ))}
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={() => (last ? dismissIntro() : setIndex((i) => i + 1))}>
          {last ? "Let's go" : 'Next'}
        </PrimaryButton>
      </div>
    </Wrap>
  )
}
