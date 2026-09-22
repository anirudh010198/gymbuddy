import { useGymStore } from '../../store/useGymStore'
import { streakWeeks, trainedToday, weekCount } from '../../engine/streak'
import { GOALS } from '../../engine/goals'
import { today, weekStart } from '../../engine/dates'
import { Wrap, Card, PrimaryButton, GhostButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import WeekDots from '../components/WeekDots'

export default function Home() {
  const profile = useGymStore((s) => s.profile)!
  const history = useGymStore((s) => s.history)
  const active = useGymStore((s) => s.active)
  const startWorkout = useGymStore((s) => s.startWorkout)
  const changeGoal = useGymStore((s) => s.changeGoal)

  const wc = weekCount(history, weekStart(today()))
  const st = streakWeeks(history, profile.target)
  const done = trainedToday(history)
  // True only when peeking at Home mid-workout (via the Workout screen's "Home" link) —
  // normal routing sends the user straight to Workout while this would be true.
  const resumable = !!active && active.date === today() && !active.finished

  return (
    <Wrap>
      <div className="mt-2 flex items-center justify-between">
        <div className="font-display text-2xl font-extrabold">GymBuddy</div>
        <button type="button" className="text-sm font-semibold text-muted" onClick={changeGoal}>
          Change goal
        </button>
      </div>
      <Card className="mt-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display font-extrabold leading-none" style={{ fontSize: '3.4rem' }}>
              {wc}
              <span className="text-muted" style={{ fontSize: '1.8rem' }}>
                /{profile.target}
              </span>
            </div>
            <div className="font-semibold text-muted">workouts this week</div>
          </div>
          <div className="text-right">
            <div className="font-display font-extrabold leading-none" style={{ fontSize: '2.2rem' }}>
              {st}
            </div>
            <div className="text-sm font-semibold text-muted">week streak</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar pct={(wc / profile.target) * 100} />
        </div>
        <div className="mt-4">
          <WeekDots history={history} />
        </div>
      </Card>
      {done ? (
        <Card className="mt-4 p-5">
          <div className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Done for today.
          </div>
          <p className="mt-1 text-muted">Muscles grow on rest days. Your next workout is ready whenever you walk in.</p>
          <GhostButton className="mt-4" onClick={startWorkout}>
            Train again anyway
          </GhostButton>
        </Card>
      ) : (
        <Card className="mt-4 p-5">
          <div className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Today: Workout {history.length % 2 ? 'B' : 'A'}
          </div>
          <p className="mt-1 text-muted">3 exercises, about 25 minutes. {GOALS[profile.goal].label}.</p>
        </Card>
      )}
      <p className="mt-6 text-sm text-muted">Your progress is saved on this phone only.</p>
      {!done && (
        <Dock raised>
          <PrimaryButton onClick={startWorkout}>{resumable ? "Resume today's workout" : "Start today's workout"}</PrimaryButton>
        </Dock>
      )}
    </Wrap>
  )
}
