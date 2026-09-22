import { motion, useReducedMotion } from 'framer-motion'

export default function Plate({ index, done, onToggle }: { index: number; done: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      aria-pressed={done}
      aria-label={`Set ${index + 1} ${done ? 'done' : 'not done'}`}
      onClick={onToggle}
      whileTap={reduce ? undefined : { scale: 1.05 }}
      transition={{ duration: 0.12 }}
      className={`relative grid h-[58px] w-[58px] place-items-center rounded-full border-[3px] transition-colors duration-150 ${
        done ? 'border-[#C99A10] bg-plate text-plate-ink' : 'border-line bg-card text-muted'
      }`}
    >
      <span className="relative z-10 font-display text-[1.15rem] font-extrabold">{done ? '✓' : index + 1}</span>
      <span
        aria-hidden="true"
        className={`absolute bottom-[9px] h-3 w-3 rounded-full border-2 bg-bg ${done ? 'border-[#C99A10]' : 'border-line'}`}
      />
    </motion.button>
  )
}
