import { AnimatePresence, motion } from 'framer-motion'

export default function Toast({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(14px+env(safe-area-inset-top,0px))] z-[60] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl bg-rubber px-4 py-2.5 text-center font-semibold text-chalk"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
