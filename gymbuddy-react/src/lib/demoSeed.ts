import { buildGroupWorkout } from '../engine/swap'
import { addDays, parseDate, today, weekStart } from '../engine/dates'
import { BY_ID } from '../engine/exercises'
import { ageBracketFor, effortStyleForAge } from '../engine/age'
import { gymCodeFor } from '../engine/gym'
import { DEFAULT_BODYWEIGHT_KG } from '../engine/progress'
import type { BusyReport } from '../engine/busyMap'
import type { Buddy } from '../engine/buddy'
import type { Equip, EffortLabel, Exercise, Group, HistoryEntry, HistoryItemEntry, Profile, SetEntry } from '../engine/types'
import type { Active, ActiveItem } from '../store/useGymStore'

const DEMO_EQUIP: Equip[] = ['machine', 'cable', 'dumbbell']
const GROUP_CYCLE: Group[] = ['legs', 'push', 'pull']
const EFFORT_CYCLE: EffortLabel[] = ['sigma', 'god', 'aura', 'casual']
const DEMO_AGE = 27
export const DEMO_GYM_NAME = 'Iron Temple Fitness'
export const DEMO_GYM_CODE = gymCodeFor(DEMO_GYM_NAME, 0, 0)

/** Gone a little quiet this week after a decent start — a realistic
 *  "should we check on them?" moment, so judges see the 5-day inactivity
 *  nudge prompt working, not just a static buddy card. */
export function buildDemoBuddy(): Buddy {
  return {
    name: 'Priya',
    workoutsThisWeek: 0,
    weekTarget: 3,
    streak: 1,
    lastTrainedDate: addDays(today(), -6),
    code: 'PRIYA7',
    pairedAt: parseDate(addDays(today(), -14)).getTime(),
    lastNudgeSentAt: null,
  }
}

/** Everything computed relative to the real "today" (not a fixed date), so
 *  the demo always looks current no matter when someone opens it:
 *  - 3 calendar weeks of training immediately before this one (2, then 3,
 *    then 4 sessions, oldest to newest — 9 total, a believable "getting more
 *    consistent" arc), which is exactly what gives a 2-week streak: the two
 *    most recent of those weeks meet the default target of 3, the oldest
 *    (2 sessions) doesn't, so streakWeeks stops there.
 *  - This week has one exercise already in progress (see buildDemoActive),
 *    which is what fills in part of the muscle map without also counting
 *    toward "9 workouts" (an unfinished session isn't in `history`). */
function trainingWeeks(): { start: string; offsets: number[] }[] {
  const curStart = weekStart(today())
  return [
    { start: addDays(curStart, -21), offsets: [0, 3] }, // oldest: 2 sessions
    { start: addDays(curStart, -14), offsets: [0, 2, 4] }, // 3 sessions
    { start: addDays(curStart, -7), offsets: [0, 2, 4, 5] }, // most recent: 4 sessions
  ]
}

function startWeightFor(ex: Exercise): number {
  // Bodyweight sets still need a real number for volume math — see
  // engine/progress.ts resolveStartWeight, same idea for real users.
  if (ex.equip === 'bodyweight') return DEFAULT_BODYWEIGHT_KG
  if (ex.equip === 'dumbbell') return 8
  if (ex.equip === 'cable') return 15
  return 20 // machine, barbell
}

function weightStepFor(ex: Exercise): number {
  if (ex.equip === 'bodyweight') return 0 // bodyweight doesn't "progress" in kg
  return ex.equip === 'dumbbell' ? 1.5 : 2.5
}

/** Weight/reps for the `cycle`-th time this exercise has come up (0, 1, 2 —
 *  a group is trained 3 times across the 9 seeded sessions), so later
 *  sessions are heavier/higher-rep than earlier ones — real progression,
 *  which is also what makes exerciseHasPB() light up naturally on the most
 *  recent session of each exercise, no hardcoded PB flag needed. */
function progressedSet(ex: Exercise, cycle: number, baseReps: number): SetEntry {
  return {
    reps: baseReps + cycle, // +0/+1/+2 reps across the 3 cycles
    weight: startWeightFor(ex) + weightStepFor(ex) * cycle * 2,
    completedAt: null, // filled in by the caller, which knows the session's date
  }
}

interface DemoSeed {
  profile: Profile
  history: HistoryEntry[]
  active: Active | null
  busyReports: BusyReport[]
}

export function buildDemoSeed(): DemoSeed {
  const weeks = trainingWeeks()
  const sessions: { date: string; group: Group }[] = []
  let groupIx = 0
  for (const w of weeks) {
    for (const offset of w.offsets) {
      sessions.push({ date: addDays(w.start, offset), group: GROUP_CYCLE[groupIx % 3] })
      groupIx++
    }
  }

  // buildGroupWorkout is pure (no history/randomness involved), so calling
  // it once per group and reusing the result every time that group recurs
  // is what makes "the same 4 legs exercises, progressively heavier" work.
  const picksByGroup: Record<Group, ReturnType<typeof buildGroupWorkout>> = {
    legs: buildGroupWorkout('legs', 'quick', DEMO_EQUIP),
    push: buildGroupWorkout('push', 'quick', DEMO_EQUIP),
    pull: buildGroupWorkout('pull', 'quick', DEMO_EQUIP),
  }
  const cycleSeenByGroup: Record<Group, number> = { legs: 0, push: 0, pull: 0 }

  const history: HistoryEntry[] = sessions.map((session, sessionIx) => {
    const cycle = cycleSeenByGroup[session.group]++
    const dayMs = parseDate(session.date).getTime()
    let totalReps = 0
    let totalVolume = 0
    let totalSets = 0

    const items: HistoryItemEntry[] = picksByGroup[session.group].map((pick, itemIx) => {
      const ex = BY_ID[pick.id]
      const log: SetEntry[] = [12, 10, 8].map((baseReps, setIx) => {
        const set = progressedSet(ex, cycle, baseReps)
        set.completedAt = dayMs + setIx * 90_000 + itemIx * 400_000
        totalReps += set.reps ?? 0
        totalVolume += (set.reps ?? 0) * (set.weight ?? 0)
        totalSets++
        return set
      })
      return { id: pick.id, log, swaps: [], effort: EFFORT_CYCLE[(sessionIx + itemIx) % EFFORT_CYCLE.length] }
    })

    return {
      date: session.date,
      dayIndex: sessionIx,
      sets: totalSets,
      reps: totalReps,
      volume: Math.round(totalVolume),
      items,
      mins: 24 + ((sessionIx * 3) % 14), // varied but deterministic, no Math.random
      group: session.group,
      // A build-muscle goal unlocks a bonus tip the first time an exercise
      // is fully completed — approximated here as "the group's first-ever
      // seeded session", so "My tips" in History has something real to show.
      tipsUnlocked: cycle === 0 ? picksByGroup[session.group].map((p) => BY_ID[p.id].bonusTip) : undefined,
    }
  })

  const lastSession = sessions[sessions.length - 1]
  const nextGroup = GROUP_CYCLE[sessions.length % 3]

  const profile: Profile = {
    goal: 'muscle',
    equip: DEMO_EQUIP,
    target: 3,
    created: weeks[0].start,
    age: DEMO_AGE,
    lastGroup: lastSession.group,
    effortStyle: effortStyleForAge(ageBracketFor(DEMO_AGE)),
    // Pre-set so the demo's Busy-Machine Map forecast works immediately —
    // no location permission prompt needed to see it in action.
    gymName: DEMO_GYM_NAME,
    gymCode: DEMO_GYM_CODE,
    bodyweightKg: DEFAULT_BODYWEIGHT_KG,
  }

  const active = buildDemoActive(nextGroup, picksByGroup[nextGroup], cycleSeenByGroup[nextGroup])
  return { profile, history, active, busyReports: buildDemoBusyReports(active) }
}

/** Seeded so the forecast always has enough data "right now", whatever real
 *  time someone actually opens /demo at: the session's first exercise gets
 *  reports in the CURRENT real hour band (busy), the second gets one
 *  (free), the rest none — enough to show a real "usually busy · usually
 *  free" line without a live crowd of other demo users. */
function buildDemoBusyReports(active: Active): BusyReport[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hourOfDay = now.getHours()
  const reports: BusyReport[] = []
  active.items.forEach((it, ix) => {
    const count = ix === 0 ? 4 : ix === 1 ? 1 : 0
    for (let i = 0; i < count; i++) {
      reports.push({ exerciseId: it.id, equipment: BY_ID[it.id].equip, gymCode: DEMO_GYM_CODE, dayOfWeek, hourOfDay })
    }
  })
  return reports
}

/** Today's session, already started — the first exercise finished (3
 *  sets), the rest not yet, which is what puts a partial fill on the
 *  muscle map and a ready-to-log card on the Workout screen instead of an
 *  empty one. Doesn't affect the 9-session/2-week-streak numbers above:
 *  an unfinished `active` workout isn't part of `history`. */
function buildDemoActive(group: Group, picks: ReturnType<typeof buildGroupWorkout>, cycle: number): Active {
  const now = Date.now()
  const items: ActiveItem[] = picks.map((pick, ix) => {
    const ex = BY_ID[pick.id]
    const done = ix === 0
    const sets = [12, 10, 8].map((baseReps, setIx) => {
      const set = progressedSet(ex, cycle, baseReps)
      return { reps: set.reps ?? baseReps, weight: set.weight, completedAt: done ? now - (3 - setIx) * 60_000 : null }
    })
    return { pattern: pick.pattern, id: pick.id, swaps: [], sets, tipShown: false, effort: done ? 'god' : undefined }
  })
  // warmupShown: true — a 3-week-old account has long since seen the
  // one-time warm-up screen; the demo should land straight on the cards.
  return { date: today(), dayIndex: 9, items, startedAt: now - 5 * 60_000, group, length: 'quick', warmupShown: true }
}
