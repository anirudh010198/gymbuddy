import type { ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGymStore } from '../store/useGymStore'
import { today } from '../engine/dates'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Workout from './screens/Workout'
import Summary from './screens/Summary'

type ScreenName = 'onboarding' | 'workout' | 'summary' | 'home'

function useScreen(): ScreenName {
  const profile = useGymStore((s) => s.profile)
  const active = useGymStore((s) => s.active)
  const lastDone = useGymStore((s) => s.lastDone)
  const showSummary = useGymStore((s) => s.showSummary)
  const peekHome = useGymStore((s) => s.peekHome)

  if (!profile) return 'onboarding'
  if (peekHome) return 'home'
  if (active && active.date === today() && !active.finished) return 'workout'
  if (lastDone === today() && showSummary) return 'summary'
  return 'home'
}

const SCREENS: Record<ScreenName, ComponentType> = {
  onboarding: Onboarding,
  workout: Workout,
  summary: Summary,
  home: Home,
}

export default function AppRoot() {
  const screen = useScreen()
  const reduce = useReducedMotion()
  const Screen = SCREENS[screen]

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: reduce ? 0 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -12 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
