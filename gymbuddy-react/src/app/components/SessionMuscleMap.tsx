import { motion, useReducedMotion } from 'framer-motion'
import type { MuscleRegion } from '../../engine/muscleMap'

const BASE_OPACITY = 0.12

function MuscleShape({
  d,
  cx,
  cy,
  r,
  active,
  progress,
  reduce,
  label,
}: {
  d?: string
  cx?: number
  cy?: number
  r?: number
  active: boolean
  progress: number
  reduce: boolean | null
  label: string
}) {
  const fillOpacity = active ? BASE_OPACITY + progress * (1 - BASE_OPACITY) : 0
  const stroke = active ? 'var(--plate)' : 'var(--line)'
  const shared = {
    fill: 'var(--plate)',
    stroke,
    strokeWidth: 1.25,
    role: 'img' as const,
    'aria-label': active ? `${label} — trained today` : label,
  }
  const anim = { animate: { fillOpacity }, transition: { duration: reduce ? 0 : 0.3 } }
  return d ? (
    <motion.path d={d} {...shared} {...anim} />
  ) : (
    <motion.ellipse cx={cx} cy={cy} rx={r} ry={r} {...shared} {...anim} />
  )
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-muted" style={{ font: '600 6.5px Barlow, sans-serif' }}>
      {text}
    </text>
  )
}

/** Front/back body outline with the muscles trained THIS SESSION highlighted
 *  and labelled (never colour-only) — same component on the workout screen
 *  (fills progressively via `progress`) and the summary screen (`progress`
 *  passed as the session's final done/total fraction). */
export default function SessionMuscleMap({ muscles, progress }: { muscles: MuscleRegion[]; progress: number }) {
  const reduce = useReducedMotion()
  const has = (m: MuscleRegion) => muscles.includes(m)

  return (
    <svg viewBox="0 0 220 150" className="mx-auto h-[120px] w-full max-w-[280px]" role="group" aria-label="Muscles worked this session">
      {/* FRONT */}
      <g transform="translate(8,0)">
        <circle cx="45" cy="13" r="11" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 Q45 23 64 28 L61 76 Q45 82 29 76 Z" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 L15 58 M64 28 L75 58" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        <MuscleShape cx={45} cy={38} r={9} active={has('chest')} progress={progress} reduce={reduce} label="Chest" />
        <MuscleShape cx={30} cy={31} r={5} active={has('shoulders')} progress={progress} reduce={reduce} label="Shoulders" />
        <MuscleShape cx={60} cy={31} r={5} active={has('shoulders')} progress={progress} reduce={reduce} label="Shoulders" />
        <MuscleShape cx={17} cy={48} r={5} active={has('biceps')} progress={progress} reduce={reduce} label="Biceps" />
        <MuscleShape cx={73} cy={48} r={5} active={has('biceps')} progress={progress} reduce={reduce} label="Biceps" />
        <MuscleShape
          d="M30 78 L26 128 L39 128 L43 90 L47 90 L51 128 L64 128 L60 78 Z"
          active={has('quads')}
          progress={progress}
          reduce={reduce}
          label="Quads"
        />
        {has('chest') && <Label x={45} y={41} text="Chest" />}
        {has('shoulders') && <Label x={45} y={22} text="Shoulders" />}
        {has('biceps') && <Label x={45} y={62} text="Biceps" />}
        {has('quads') && <Label x={45} y={110} text="Quads" />}
        <text x="45" y="143" textAnchor="middle" className="fill-muted" style={{ font: '600 8px Barlow, sans-serif' }}>
          Front
        </text>
      </g>
      {/* BACK */}
      <g transform="translate(130,0)">
        <circle cx="45" cy="13" r="11" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 Q45 23 64 28 L61 76 Q45 82 29 76 Z" fill="none" stroke="var(--line)" strokeWidth="2" />
        <path d="M26 28 L15 58 M64 28 L75 58" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        <MuscleShape cx={30} cy={31} r={5} active={has('rearShoulders')} progress={progress} reduce={reduce} label="Rear shoulders" />
        <MuscleShape cx={60} cy={31} r={5} active={has('rearShoulders')} progress={progress} reduce={reduce} label="Rear shoulders" />
        <MuscleShape cx={38} cy={42} r={7} active={has('lats')} progress={progress} reduce={reduce} label="Lats" />
        <MuscleShape cx={52} cy={42} r={7} active={has('lats')} progress={progress} reduce={reduce} label="Lats" />
        <MuscleShape cx={45} cy={62} r={7} active={has('midBack')} progress={progress} reduce={reduce} label="Mid back" />
        <MuscleShape cx={17} cy={48} r={5} active={has('triceps')} progress={progress} reduce={reduce} label="Triceps" />
        <MuscleShape cx={73} cy={48} r={5} active={has('triceps')} progress={progress} reduce={reduce} label="Triceps" />
        <MuscleShape
          d="M30 78 L27 104 L38 104 L42 90 L48 90 L52 104 L63 104 L60 78 Z"
          active={has('glutes')}
          progress={progress}
          reduce={reduce}
          label="Glutes"
        />
        <MuscleShape
          d="M27 104 L26 128 L37 128 L38 104 Z M52 104 L51 128 L62 128 L63 104 Z"
          active={has('hamstrings')}
          progress={progress}
          reduce={reduce}
          label="Hamstrings"
        />
        <MuscleShape
          d="M27 104 L37 104 L36 128 L28 128 Z M63 104 L53 104 L54 128 L62 128 Z"
          active={has('calves')}
          progress={progress}
          reduce={reduce}
          label="Calves"
        />
        {has('rearShoulders') && <Label x={45} y={22} text="Rear delts" />}
        {has('lats') && <Label x={45} y={38} text="Lats" />}
        {has('midBack') && <Label x={45} y={65} text="Mid back" />}
        {has('glutes') && <Label x={45} y={92} text="Glutes" />}
        {(has('hamstrings') || has('calves')) && <Label x={45} y={118} text={has('hamstrings') ? 'Hamstrings' : 'Calves'} />}
        <text x="45" y="143" textAnchor="middle" className="fill-muted" style={{ font: '600 8px Barlow, sans-serif' }}>
          Back
        </text>
      </g>
    </svg>
  )
}
