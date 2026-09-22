import { useGym } from '../../store/GymStoreContext'
import { BY_ID } from '../../engine/exercises'
import { Wrap, Card, Tag } from '../components/ui'

export default function History() {
  const history = useGym((s) => s.history)
  const reversed = [...history].reverse()
  const myTips = Array.from(new Set(history.flatMap((h) => h.tipsUnlocked ?? [])))

  return (
    <Wrap>
      <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: '2rem' }}>
        History
      </h1>

      {reversed.length === 0 ? (
        <p className="mt-4 text-muted">No workouts logged yet. Finish your first one and it'll show up here.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {reversed.map((h, i) => {
            const swapCount = h.items.reduce((a, it) => a + it.swaps.length, 0)
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                    {h.date}
                  </span>
                  <Tag>Workout {h.dayIndex % 2 ? 'B' : 'A'}</Tag>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {h.sets} sets · {h.reps} reps{swapCount ? ` · ${swapCount} swap${swapCount > 1 ? 's' : ''}` : ''} · {h.mins} min
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {h.items.map((it, ix) => (
                    <span key={ix}>{BY_ID[it.id]?.name ?? 'Exercise'}</span>
                  ))}
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
