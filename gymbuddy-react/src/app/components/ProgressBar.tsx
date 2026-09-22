import { motion, useReducedMotion } from 'framer-motion'

export default function ProgressBar({ pct }: { pct: number }) {
  const reduce = useReducedMotion()
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div className="h-[10px] overflow-hidden rounded-full bg-soft">
      <motion.div
        className="h-full bg-plate"
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: reduce ? 0 : 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}
