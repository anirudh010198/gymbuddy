import { useState } from 'react'
import { useGym } from '../../store/GymStoreContext'
import { streakWeeks, trainedToday, weekCount } from '../../engine/streak'
import { today, weekStart } from '../../engine/dates'
import { suggestNextGroup } from '../../engine/swap'
import { GROUP_LABEL } from '../../engine/templates'
import { Wrap, Card, PrimaryButton, GhostButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import WeekDots from '../components/WeekDots'
import InstallHint from '../components/InstallHint'
import DaySelectSheet from '../components/DaySelectSheet'

export default function Home() {
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const active = useGym((s) => s.active)
  const startWorkout = useGym((s) => s.startWorkout)
  const changeGoal = useGym((s) => s.changeGoal)
  const [daySelectOpen, setDaySelectOpen] = useState(false)

  const wc = weekCount(history, weekStart(today()))
  const st = streakWeeks(history, profile.target)
  const done = trainedToday(history)
  // True only when peeking at Home mid-workout (via the Workout screen's "Home" link) —
  // normal routing sends the user straight to Workout while this would be true.
  const resumable = !!active && active.date === today() && !active.finished
  const suggested = suggestNextGroup(profile.lastGroup)

  function handleStartTap() {
    if (resumable && active) {
      startWorkout(active.group, active.length) // no-op guard inside the store — just lets screen-derivation resume it
      return
    }
    setDaySelectOpen(true)
  }

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
            <div data-testid="week-count" className="font-display font-extrabold leading-none" style={{ fontSize: '3.4rem' }}>
              {wc}
              <span className="text-muted" style={{ fontSize: '1.8rem' }}>
                /{profile.target}
              </span>
            </div>
            <div className="font-semibold text-muted">workouts this week</div>
          </div>
          <div className="text-right">
            <div data-testid="week-streak" className="font-display font-extrabold leading-none" style={{ fontSize: '2.2rem' }}>
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
          <GhostButton className="mt-4" onClick={() => setDaySelectOpen(true)}>
            Train again anyway
          </GhostButton>
        </Card>
      ) : (
        <Card className="mt-4 p-5">
          <div className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            {resumable ? 'Workout in progress' : `Today: ${GROUP_LABEL[suggested]} suggested`}
          </div>
          <p className="mt-1 text-muted">
            {resumable ? 'Pick up where you left off.' : "Pick your own day, or let us choose when you're ready."}
          </p>
        </Card>
      )}
      <InstallHint eligible={history.length > 0} />
      <p className="mt-6 text-sm text-muted">Your progress is saved on this phone only.</p>
      {!done && (
        <Dock raised>
          <PrimaryButton onClick={handleStartTap}>{resumable ? "Resume today's workout" : "Start today's workout"}</PrimaryButton>
        </Dock>
      )}
      <DaySelectSheet
        open={daySelectOpen}
        lastGroup={profile.lastGroup}
        suggestFull={history.length >= 2}
        onStart={(group, length) => {
          setDaySelectOpen(false)
          startWorkout(group, length)
        }}
        onClose={() => setDaySelectOpen(false)}
      />
    </Wrap>
  )
}
