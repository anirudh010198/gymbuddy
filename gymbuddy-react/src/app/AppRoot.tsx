import { useEffect, useRef, type ComponentType } from 'react'
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
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Reset scroll position on every screen change. In the real /app the
    // window itself scrolls; embedded in the landing page's phone-frame demo,
    // the frame's own overflow-y ancestor scrolls instead — walk up and reset
    // whichever one applies, so a new screen never renders starting mid-scroll
    // from wherever the previous screen left off.
    const el = rootRef.current
    if (!el) return
    let node: HTMLElement | null = el.parentElement
    while (node) {
      const style = getComputedStyle(node)
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        node.scrollTop = 0
        return
      }
      node = node.parentElement
    }
    window.scrollTo(0, 0)
  }, [screen])

  return (
    <Wrapper
      ref={(el: HTMLElement | null) => {
        rootRef.current = el
      }}
      className="min-h-screen bg-bg font-sans text-ink"
    >
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
