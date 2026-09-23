import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import { useBuddySource } from '../../store/BuddySourceContext'
import { streakWeeks, trainedToday, weekCount } from '../../engine/streak'
import { today, weekStart } from '../../engine/dates'
import { suggestNextGroup } from '../../engine/swap'
import { GROUP_LABEL } from '../../engine/templates'
import { parseInvitePayload } from '../../engine/buddy'
import { Wrap, Card, PrimaryButton, GhostButton, Dock } from '../components/ui'
import ProgressBar from '../components/ProgressBar'
import WeekDots from '../components/WeekDots'
import InstallHint from '../components/InstallHint'
import DaySelectSheet from '../components/DaySelectSheet'
import BuildWorkoutFlow from '../components/BuildWorkoutFlow'
import BuddySheet from '../components/BuddySheet'
import BuddyStrip from '../components/BuddyStrip'
import { nudgeBuddy } from '../lib/buddyActions'

export default function Home() {
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const active = useGym((s) => s.active)
  const lastCustomWorkout = useGym((s) => s.lastCustomWorkout)
  const startWorkout = useGym((s) => s.startWorkout)
  const startCustomWorkout = useGym((s) => s.startCustomWorkout)
  const setPeekHome = useGym((s) => s.setPeekHome)
  const changeGoal = useGym((s) => s.changeGoal)
  const trackEvent = useGym((s) => s.trackEvent)
  const buddySource = useBuddySource()
  const [daySelectOpen, setDaySelectOpen] = useState(false)
  const [buildOpen, setBuildOpen] = useState(false)
  const [buddySheetOpen, setBuddySheetOpen] = useState(false)
  const [buddy, setBuddy] = useState(() => buddySource.getBuddy())
  const [searchParams, setSearchParams] = useSearchParams()
  const incomingInvite = parseInvitePayload(searchParams.toString())

  // A shared invite link/message lands here (see engine/buddy.ts) — open
  // straight into the accept step, no extra tap needed to find it.
  useEffect(() => {
    if (incomingInvite) setBuddySheetOpen(true)
    // Only re-check when the raw query actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  function refreshBuddy() {
    setBuddy(buddySource.getBuddy())
  }

  const wc = weekCount(history, weekStart(today()))
  const st = streakWeeks(history, profile.target)
  const done = trainedToday(history)
  // True only when peeking at Home mid-workout (via the Workout screen's "Home" link) —
  // normal routing sends the user straight to Workout while this would be true.
  const resumable = !!active && active.date === today() && !active.finished
  const suggested = suggestNextGroup(profile.lastGroup)

  function handleStartTap() {
    if (resumable) {
      setPeekHome(false) // just clears the mid-workout "peek" flag so screen-derivation resumes it
      return
    }
    setDaySelectOpen(true)
  }

  // Day-selection is the first thing shown, every session — not a screen
  // the user has to go tap for. Only when there's a genuine choice to make:
  // not mid-workout (nothing to pick), not already done for today (that's
  // the deliberate "Train again anyway" path instead).
  useEffect(() => {
    if (!done && !resumable) setDaySelectOpen(true)
    // Deliberately empty deps: fire once per mount only, not every time
    // `done`/`resumable` change (that would reopen the sheet mid-interaction).
  }, [])

  return (
    <Wrap>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Today</h1>
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
      {buddy ? (
        <BuddyStrip
          buddy={buddy}
          myWeekCount={wc}
          myTarget={profile.target}
          onNudge={async () => {
            await nudgeBuddy(buddySource, buddy, trackEvent)
            refreshBuddy()
          }}
          onManage={() => setBuddySheetOpen(true)}
        />
      ) : (
        <Card className="mt-4 p-4">
          <p className="text-sm text-muted">A gym partner makes the hard days easier — 7 in 10 people say so.</p>
          <button
            type="button"
            className="mt-1 text-sm font-semibold underline decoration-line underline-offset-2"
            onClick={() => setBuddySheetOpen(true)}
          >
            Train with a buddy
          </button>
        </Card>
      )}
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
        lastCustomWorkout={lastCustomWorkout}
        onStart={(group, length) => {
          setDaySelectOpen(false)
          startWorkout(group, length)
        }}
        onBuildOwn={() => {
          setDaySelectOpen(false)
          setBuildOpen(true)
        }}
        onRepeatCustom={() => {
          setDaySelectOpen(false)
          if (lastCustomWorkout) startCustomWorkout(lastCustomWorkout.group, lastCustomWorkout.picks)
        }}
        onClose={() => setDaySelectOpen(false)}
      />
      {buildOpen && (
        <BuildWorkoutFlow
          goal={profile.goal}
          onStart={(group, picks) => {
            setBuildOpen(false)
            startCustomWorkout(group, picks)
          }}
          onClose={() => setBuildOpen(false)}
        />
      )}
      <BuddySheet
        open={buddySheetOpen}
        incomingInvite={incomingInvite}
        onIncomingHandled={() => setSearchParams({}, { replace: true })}
        onClose={() => {
          setBuddySheetOpen(false)
          refreshBuddy()
        }}
      />
    </Wrap>
  )
}
