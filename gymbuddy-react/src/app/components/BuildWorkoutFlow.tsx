import { useMemo, useState } from 'react'
import { EXERCISES } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { goalTargetReps } from '../../engine/progress'
import { SETS } from '../../engine/goals'
import { EQUIP_FILTER_OPTIONS, LEVEL_FILTER_OPTIONS, FilterChip } from './ExerciseFilters'
import FormGuide from './FormGuide'
import { Wrap, PrimaryButton, Dock } from './ui'
import type { CustomWorkoutPick, Equip, Exercise, GoalKey, Group } from '../../engine/types'

const GROUP_CHOICES: { key: Group | 'mixed'; label: string; sub: string }[] = [
  { key: 'legs', label: 'Legs', sub: 'Quads, hamstrings, glutes' },
  { key: 'push', label: 'Push', sub: 'Chest, shoulders, triceps' },
  { key: 'pull', label: 'Pull', sub: 'Back, biceps' },
  { key: 'mixed', label: 'Mixed', sub: 'Any muscle group, your call' },
]

const GROUPS: Group[] = ['legs', 'push', 'pull']
const MAX_EXERCISES = 8
const MIN_SETS = 1
const MAX_SETS = 5
const MIN_REPS = 4
const MAX_REPS = 30

function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-9 w-9 rounded-full border-2 border-line font-display text-lg font-bold disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center font-display text-lg font-bold">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-9 w-9 rounded-full border-2 border-line font-display text-lg font-bold disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}

/** "Build my own" — the full flow the day-select sheet's third option opens:
 *  pick a group (or Mixed), pick up to 8 exercises with the same search and
 *  filters as /exercises, set each one's sets/reps, then start. A full-screen
 *  takeover like Onboarding, not a Sheet — there's too much content for one. */
export default function BuildWorkoutFlow({
  goal,
  onStart,
  onClose,
}: {
  goal: GoalKey
  onStart: (group: Group | 'mixed', picks: CustomWorkoutPick[]) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [group, setGroup] = useState<Group | 'mixed' | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [equipFilter, setEquipFilter] = useState<Set<Equip>>(new Set())
  const [levelFilter, setLevelFilter] = useState<Set<number>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [config, setConfig] = useState<Record<string, { sets: number; reps: number }>>({})

  const defaultReps = goalTargetReps(goal)

  function toggleEquip(k: Equip) {
    setEquipFilter((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }
  function toggleLevel(l: number) {
    setLevelFilter((prev) => {
      const next = new Set(prev)
      if (next.has(l)) next.delete(l)
      else next.add(l)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (equipFilter.size > 0 && !equipFilter.has(e.equip)) return false
      if (levelFilter.size > 0 && !levelFilter.has(e.level)) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.muscles.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, equipFilter, levelFilter])

  const visibleGroups = group === 'mixed' || group === null ? GROUPS : [group]
  const selectedSet = new Set(selectedIds)

  function toggleSelect(ex: Exercise) {
    setSelectedIds((prev) => {
      if (prev.includes(ex.id)) return prev.filter((id) => id !== ex.id)
      if (prev.length >= MAX_EXERCISES) return prev
      return [...prev, ex.id]
    })
  }

  function pickGroup(g: Group | 'mixed') {
    setGroup(g)
    setStep(1)
  }

  function goToConfig() {
    setConfig((prev) => {
      const next = { ...prev }
      for (const id of selectedIds) {
        if (!next[id]) next[id] = { sets: SETS, reps: defaultReps }
      }
      return next
    })
    setStep(2)
  }

  function startWorkout() {
    if (!group) return
    const picks: CustomWorkoutPick[] = selectedIds.map((id) => ({
      id,
      sets: config[id]?.sets ?? SETS,
      reps: config[id]?.reps ?? defaultReps,
    }))
    onStart(group, picks)
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
      <Wrap>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            className="font-semibold text-muted"
            onClick={() => (step === 0 ? onClose() : setStep((s) => (s - 1) as 0 | 1))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <span className="text-sm font-semibold text-muted">Step {step + 1} of 3</span>
        </div>

        {step === 0 && (
          <>
            <h1 className="mt-4 font-display font-extrabold leading-none" style={{ fontSize: '2rem' }}>
              Build my own
            </h1>
            <p className="mt-2 text-muted">What muscle group are you focusing on?</p>
            <div className="mt-5 grid gap-2">
              {GROUP_CHOICES.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => pickGroup(o.key)}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-line bg-card p-4 text-left"
                >
                  <div>
                    <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                      {o.label}
                    </div>
                    <div className="text-sm text-muted">{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="mt-4 font-display font-extrabold leading-none" style={{ fontSize: '2rem' }}>
              Pick exercises
            </h1>
            <p className="mt-2 text-muted">Up to {MAX_EXERCISES}. Search, filter, or open any exercise for its form guide.</p>
            <div className="mt-5 grid gap-4">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or muscle…"
                className="w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
                aria-label="Search exercises by name or muscle"
              />
              <div>
                <div className="text-sm font-semibold text-muted">Equipment</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EQUIP_FILTER_OPTIONS.map((o) => (
                    <FilterChip key={o.key} pressed={equipFilter.has(o.key)} onClick={() => toggleEquip(o.key)}>
                      {o.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-muted">Level</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEVEL_FILTER_OPTIONS.map((l) => (
                    <FilterChip key={l} pressed={levelFilter.has(l)} onClick={() => toggleLevel(l)}>
                      {`Level ${l}`}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>

            {visibleGroups.map((g) => {
              const items = filtered.filter((e) => e.group === g)
              if (!items.length) return null
              return (
                <section key={g} className="mt-6">
                  <h2 className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                    {GROUP_LABEL[g]}
                  </h2>
                  <div className="mt-2 grid gap-2">
                    {items.map((ex) => {
                      const expanded = expandedId === ex.id
                      const selected = selectedSet.has(ex.id)
                      const disabled = !selected && selectedIds.length >= MAX_EXERCISES
                      return (
                        <div key={ex.id} className="rounded-2xl border-2 border-line bg-card">
                          <div className="flex items-center gap-2 p-3">
                            <button
                              type="button"
                              className="flex-1 text-left"
                              onClick={() => setExpandedId(expanded ? null : ex.id)}
                              aria-expanded={expanded}
                            >
                              <div className="font-display font-bold" style={{ fontSize: '1.05rem' }}>
                                {ex.name}
                              </div>
                              <div className="text-sm text-muted">
                                {ex.equip} · level {ex.level} · {ex.muscles}
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleSelect(ex)}
                              aria-pressed={selected}
                              className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold disabled:opacity-30 ${
                                selected ? 'border-plate bg-plate text-plate-ink' : 'border-line'
                              }`}
                            >
                              {selected ? 'Added' : 'Add'}
                            </button>
                          </div>
                          {expanded && (
                            <div className="border-t border-line p-3">
                              <FormGuide exercise={ex} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
            {filtered.length === 0 && <p className="mt-8 text-muted">No exercises match those filters.</p>}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mt-4 font-display font-extrabold leading-none" style={{ fontSize: '2rem' }}>
              Sets &amp; reps
            </h1>
            <p className="mt-2 text-muted">Defaults come from your goal — adjust anything before you start.</p>
            <div className="mt-5 grid gap-3">
              {selectedIds.map((id) => {
                const ex = EXERCISES.find((e) => e.id === id)!
                const c = config[id] ?? { sets: SETS, reps: defaultReps }
                return (
                  <div key={id} className="rounded-2xl border-2 border-line bg-card p-4">
                    <div className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                      {ex.name}
                    </div>
                    <div className="mt-3 flex gap-6">
                      <NumberStepper
                        label="Sets"
                        value={c.sets}
                        min={MIN_SETS}
                        max={MAX_SETS}
                        onChange={(v) => setConfig((prev) => ({ ...prev, [id]: { ...c, sets: v } }))}
                      />
                      <NumberStepper
                        label="Target reps"
                        value={c.reps}
                        min={MIN_REPS}
                        max={MAX_REPS}
                        onChange={(v) => setConfig((prev) => ({ ...prev, [id]: { ...c, reps: v } }))}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Wrap>

      {step === 1 && (
        <Dock>
          <PrimaryButton disabled={selectedIds.length === 0} onClick={goToConfig}>
            {selectedIds.length === 0 ? 'Pick at least 1' : `Continue (${selectedIds.length}/${MAX_EXERCISES})`}
          </PrimaryButton>
        </Dock>
      )}
      {step === 2 && (
        <Dock>
          <PrimaryButton onClick={startWorkout}>Start workout</PrimaryButton>
        </Dock>
      )}
    </div>
  )
}
