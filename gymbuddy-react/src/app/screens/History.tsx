import { useGym } from '../../store/GymStoreContext'
import { BY_ID } from '../../engine/exercises'
import { GROUP_LABEL } from '../../engine/templates'
import { ageBracketFor, effortStyleForAge, EFFORT_STYLES } from '../../engine/age'
import { exerciseHasPB } from '../../engine/progress'
import { Wrap, Card, Tag } from '../components/ui'

export default function History() {
  const history = useGym((s) => s.history)
  const profile = useGym((s) => s.profile)!
  const myTips = Array.from(new Set(history.flatMap((h) => h.tipsUnlocked ?? [])))
  const effortContent = EFFORT_STYLES[profile.effortStyle ?? effortStyleForAge(ageBracketFor(profile.age))]

  // Newest first for display, but PB-ness for a given workout depends on
  // everything STRICTLY BEFORE it chronologically — compute that against
  // the original (oldest-first) order before reversing.
  const withPriorHistory = history.map((h, i) => ({ entry: h, priorHistory: history.slice(0, i) }))
  const reversed = [...withPriorHistory].reverse()

  return (
    <Wrap>
      <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: '2rem' }}>
        History
      </h1>

      {reversed.length === 0 ? (
        <p className="mt-4 text-muted">No workouts logged yet. Finish your first one and it'll show up here.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {reversed.map(({ entry: h, priorHistory }, i) => {
            const swapCount = h.items.reduce((a, it) => a + it.swaps.length, 0)
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                    {h.date}
                  </span>
                  <Tag>{h.group ? (h.group === 'mixed' ? 'Mixed' : GROUP_LABEL[h.group]) : `Workout ${h.dayIndex % 2 ? 'B' : 'A'}`}</Tag>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {h.sets} sets · {h.reps} reps{swapCount ? ` · ${swapCount} swap${swapCount > 1 ? 's' : ''}` : ''} · {h.mins} min
                </div>
                <div className="mt-3 grid gap-1.5">
                  {h.items.map((it, ix) => {
                    const isPB = exerciseHasPB(priorHistory, it.id, it.log)
                    return (
                      <div key={ix} className="flex items-center justify-between gap-2 text-sm">
                        <span>
                          {BY_ID[it.id]?.name ?? 'Exercise'}
                          {isPB && <span className="ml-1.5 rounded-full bg-plate px-1.5 py-0.5 text-xs font-bold text-plate-ink">★ PB</span>}
                        </span>
                        {it.effort && <span className="shrink-0 text-muted">{effortContent[it.effort].emoji} {effortContent[it.effort].label}</span>}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {myTips.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
            My tips
          </h2>
          <div className="grid gap-2">
            {myTips.map((tip, i) => (
              <Card key={i} className="p-3 text-sm">
                {tip}
              </Card>
            ))}
          </div>
        </>
      )}
    </Wrap>
  )
}
