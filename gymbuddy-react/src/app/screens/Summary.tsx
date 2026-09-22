import { useGymStore } from '../../store/useGymStore'
import { streakWeeks, weekCount } from '../../engine/streak'
import { today, weekStart } from '../../engine/dates'
import { Wrap, Card, Chip, PrimaryButton, Dock } from '../components/ui'
import WeekDots from '../components/WeekDots'

const FEELS = ['Too easy', 'About right', 'Too hard'] as const

export default function Summary() {
  const history = useGymStore((s) => s.history)
  const profile = useGymStore((s) => s.profile)!
  const setFeel = useGymStore((s) => s.setFeel)
  const dismissSummary = useGymStore((s) => s.dismissSummary)

  const last = history[history.length - 1]
  const wc = weekCount(history, weekStart(today()))
  const target = profile.target
  const st = streakWeeks(history, target)

  if (!last) return null

  const msg = wc >= target ? "Weekly target hit. That's the whole game in month one." : `${target - wc} more this week to keep your streak.`

  return (
    <Wrap>
      <div className="mt-8 font-display font-extrabold text-go" style={{ fontSize: '1.3rem' }}>
        Workout {history.length} complete
      </div>
      <div className="font-display font-extrabold leading-[0.95]" style={{ fontSize: '3.6rem' }}>
        You showed up.
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2.2rem' }}>
            {last.sets}
          </div>
          <div className="text-sm text-muted">sets</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2.2rem' }}>
            {wc}/{target}
          </div>
          <div className="text-sm text-muted">this week</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="font-display font-extrabold" style={{ fontSize: '2.2rem' }}>
            {st}
          </div>
          <div className="text-sm text-muted">week streak</div>
        </Card>
      </div>
      <p className="mt-4 font-semibold">{msg}</p>
      <Card className="mt-4 p-4">
        <WeekDots history={history} />
      </Card>
      <Card className="mt-4 p-4">
        <div className="font-display font-bold" style={{ fontSize: '1.3rem' }}>
          How did today feel?
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FEELS.map((f) => (
            <Chip key={f} pressed={last.feel === f} className="text-center font-semibold" onClick={() => setFeel(f)}>
              {f}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          Next time we'll{' '}
          {last.feel === 'Too easy'
            ? 'suggest adding a little weight'
            : last.feel === 'Too hard'
              ? 'suggest lighter weight or fewer reps'
              : 'keep the same targets'}
          .
        </p>
      </Card>
      <Dock>
        <PrimaryButton onClick={dismissSummary}>Done</PrimaryButton>
      </Dock>
    </Wrap>
  )
}
