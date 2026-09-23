import { type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGym } from '../store/GymStoreContext'
import type { TabKey } from '../engine/types'
import Home from './screens/Home'
import RushRadar from './screens/RushRadar'
import History from './screens/History'
import Settings from './screens/Settings'

const TABS: Record<TabKey, ComponentType> = {
  today: Home,
  rush: RushRadar,
  history: History,
  settings: Settings,
}

/** Which tab renders — the bottom nav that drives this now lives in AppRoot
 *  (persistent across every app screen, not just these three tabs). */
export default function TabsShell() {
  const tab = useGym((s) => s.activeTab)
  const reduce = useReducedMotion()
  const Screen = TABS[tab]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.15 }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  )
}
