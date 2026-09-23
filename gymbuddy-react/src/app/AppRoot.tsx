import { useEffect, useRef, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGym } from '../store/GymStoreContext'
import { today } from '../engine/dates'
import Onboarding from './screens/Onboarding'
import AuthStep from './screens/AuthStep'
import Workout from './screens/Workout'
import Cooldown from './screens/Cooldown'
import Summary from './screens/Summary'
import TabsShell from './TabsShell'
import AppTopBar from './components/AppTopBar'
import BottomNav from './components/BottomNav'
import SyncBridge from './components/SyncBridge'

type ScreenName = 'onboarding' | 'auth' | 'workout' | 'cooldown' | 'summary' | 'home'

function useScreen(): ScreenName {
  const profile = useGym((s) => s.profile)
  const active = useGym((s) => s.active)
  const lastDone = useGym((s) => s.lastDone)
  const showSummary = useGym((s) => s.showSummary)
  const peekHome = useGym((s) => s.peekHome)
  const authPending = useGym((s) => s.postOnboardingAuthPending)
  const cooldownPending = useGym((s) => s.cooldownPending)

  if (!profile) return 'onboarding'
  // Its own flag, not just "just finished onboarding" — the profile already
  // exists by this point, so the workout is never blocked behind it; this
  // is purely "show the optional sign-in prompt once, right after".
  if (authPending) return 'auth'
  if (peekHome) return 'home'
  if (active && active.date === today() && !active.finished) return 'workout'
  // finishWorkout sets both cooldownPending and showSummary at once — the
  // cool-down interstitial comes first, dismissCooldown just clears its own
  // flag so the very next render falls through to summary below.
  if (cooldownPending) return 'cooldown'
  if (lastDone === today() && showSummary) return 'summary'
  return 'home'
}

const SCREENS: Record<ScreenName, ComponentType> = {
  onboarding: Onboarding,
  auth: AuthStep,
  workout: Workout,
  cooldown: Cooldown,
  summary: Summary,
  home: TabsShell,
}

export default function AppRoot({ asMain = true, demo = false }: { asMain?: boolean; demo?: boolean }) {
  const screen = useScreen()
  const reduce = useReducedMotion()
  const Screen = SCREENS[screen]
  const activeTab = useGym((s) => s.activeTab)
  const setActiveTab = useGym((s) => s.setActiveTab)
  const setPeekHome = useGym((s) => s.setPeekHome)
  // asMain=false is for embedding this tree somewhere that already has its
  // own <main> landmark — nothing currently does, but the option costs
  // nothing to keep.
  const Wrapper = asMain ? 'main' : 'div'
  const rootRef = useRef<HTMLElement | null>(null)

  // Every screen except onboarding (no profile to route to yet) gets the
  // persistent chrome, so there's always a way out without the browser back
  // button. Tapping a bottom-nav tab both selects it and clears peekHome, so
  // it also escapes an in-progress workout/summary back to that tab.
  function handleTabChange(tab: Parameters<typeof setActiveTab>[0]) {
    setActiveTab(tab)
    setPeekHome(true)
  }

  useEffect(() => {
    // Reset scroll position on every screen change, whichever ancestor
    // actually scrolls, so a new screen never renders starting mid-scroll
    // from wherever the previous one left off.
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

  const showChrome = screen !== 'onboarding' && screen !== 'auth'

  return (
    <Wrapper
      ref={(el: HTMLElement | null) => {
        rootRef.current = el
      }}
      className="min-h-screen bg-bg font-sans text-ink"
    >
      {!demo && <SyncBridge />}
      {showChrome && <AppTopBar showExitLink={asMain} demo={demo} />}
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
      {showChrome && <BottomNav active={activeTab} onChange={handleTabChange} />}
    </Wrapper>
  )
}
