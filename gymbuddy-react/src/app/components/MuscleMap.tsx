import { motion, useReducedMotion } from 'framer-motion'
import type { Group } from '../../engine/types'

const BASE_OPACITY = 0.12

function Region({
  d,
  progress,
  reduce,
  label,
  onTap,
}: {
  d: string
  progress: number
  reduce: boolean | null
  label: string
  onTap: () => void
}) {
  return (
    <motion.path
      d={d}
      fill="var(--plate)"
      stroke="var(--line)"
      strokeWidth={1.5}
      animate={{ fillOpacity: BASE_OPACITY + progress * (1 - BASE_OPACITY) }}
      transition={{ duration: reduce ? 0 : 0.3 }}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      style={{ cursor: 'pointer' }}
    />
  )
}

/** Two simple front/back silhouettes with tappable Legs/Push/Pull regions that
 *  fill plate-yellow as today's sets are logged. Not anatomically literal —
 *  just enough shape to read as "front" and "back" at a glance. */
export default function MuscleMap({
  legsProgress,
  pushProgress,
  pullProgress,
  onTap,
}: {
  legsProgress: number
  pushProgress: number
  pullProgress: number
  onTap: (group: Group) => void
}) {
  const reduce = useReducedMotion()

  return (
    <svg viewBox="0 0 220 140" className="mx-auto h-[110px] w-full max-w-[260px]" aria-hidden="false" role="group" aria-label="Muscles worked today">
      {/* FRONT */}
      <g transform="translate(8,0)">
        <circle cx="45" cy="13" r="11" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 Q45 23 64 28 L61 76 Q45 82 29 76 Z" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 L15 58 M64 28 L75 58" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        <Region
          d="M28 30 Q45 26 62 30 L59 54 Q45 58 31 54 Z"
          progress={pushProgress}
          reduce={reduce}
          label="Push exercise — chest and shoulders"
          onTap={() => onTap('push')}
        />
        <Region
          d="M30 78 L26 128 L39 128 L43 90 L47 90 L51 128 L64 128 L60 78 Z"
          progress={legsProgress}
          reduce={reduce}
          label="Legs exercise"
          onTap={() => onTap('legs')}
        />
        <text x="45" y="138" textAnchor="middle" className="fill-muted" style={{ font: '600 8px Barlow, sans-serif' }}>
          Front
        </text>
      </g>
      {/* BACK */}
      <g transform="translate(130,0)">
        <circle cx="45" cy="13" r="11" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 Q45 23 64 28 L61 76 Q45 82 29 76 Z" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 L15 58 M64 28 L75 58" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        <Region
          d="M28 30 Q45 26 62 30 L59 60 Q45 66 31 60 Z"
          progress={pullProgress}
          reduce={reduce}
          label="Pull exercise — back"
          onTap={() => onTap('pull')}
        />
        <Region
          d="M30 78 L26 128 L39 128 L43 90 L47 90 L51 128 L64 128 L60 78 Z"
          progress={legsProgress}
          reduce={reduce}
          label="Legs exercise"
          onTap={() => onTap('legs')}
        />
        <text x="45" y="138" textAnchor="middle" className="fill-muted" style={{ font: '600 8px Barlow, sans-serif' }}>
          Back
        </text>
      </g>
    </svg>
  )
}
