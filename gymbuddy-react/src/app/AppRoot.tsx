import type { ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGym } from '../store/GymStoreContext'
import { today } from '../engine/dates'
import Onboarding from './screens/Onboarding'
import Workout from './screens/Workout'
import Summary from './screens/Summary'
import TabsShell from './TabsShell'

type ScreenName = 'onboarding' | 'workout' | 'summary' | 'home'

function useScreen(): ScreenName {
  const profile = useGym((s) => s.profile)
  const active = useGym((s) => s.active)
  const lastDone = useGym((s) => s.lastDone)
  const showSummary = useGym((s) => s.showSummary)
  const peekHome = useGym((s) => s.peekHome)

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
  home: TabsShell,
}

export default function AppRoot({ asMain = true }: { asMain?: boolean }) {
  const screen = useScreen()
  const reduce = useReducedMotion()
  const Screen = SCREENS[screen]
  // The landing page embeds a second copy of this tree in its phone-frame demo —
  // asMain=false there so the page doesn't end up with two <main> landmarks.
  const Wrapper = asMain ? 'main' : 'div'

  return (
    <Wrapper className="min-h-screen bg-bg font-sans text-ink">
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
    </Wrapper>
  )
}
