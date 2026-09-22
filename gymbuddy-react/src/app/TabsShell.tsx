import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import BottomNav, { type TabKey } from './components/BottomNav'
import Home from './screens/Home'
import History from './screens/History'
import Settings from './screens/Settings'

const TABS: Record<TabKey, ComponentType> = {
  today: Home,
  history: History,
  settings: Settings,
}

export default function TabsShell() {
  const [tab, setTab] = useState<TabKey>('today')
  const reduce = useReducedMotion()
  const Screen = TABS[tab]

  return (
    <>
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
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
