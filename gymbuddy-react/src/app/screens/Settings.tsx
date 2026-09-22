import { useState } from 'react'
import { useGymStore } from '../../store/useGymStore'
import { EQUIP_OPTIONS, GOALS } from '../../engine/goals'
import type { Equip, GoalKey } from '../../engine/types'
import { Wrap, Card, Chip, GhostButton } from '../components/ui'

export default function Settings() {
  const profile = useGymStore((s) => s.profile)!
  const history = useGymStore((s) => s.history)
  const events = useGymStore((s) => s.events)
  const updateProfile = useGymStore((s) => s.updateProfile)
  const resetData = useGymStore((s) => s.resetData)
  const [confirmReset, setConfirmReset] = useState(false)

  function toggleEquip(k: Equip) {
    const has = profile.equip.includes(k)
    const next = has ? profile.equip.filter((e) => e !== k) : [...profile.equip, k]
    if (has && next.length === 0) return // always keep at least one (bodyweight is implicit anyway, but avoid an empty picker)
    updateProfile({ equip: next })
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile, history, events }, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gymbuddy-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Wrap>
      <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: '2rem' }}>
        Settings
      </h1>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Goal
      </h2>
      <div className="grid gap-2">
        {(Object.entries(GOALS) as [GoalKey, (typeof GOALS)[GoalKey]][]).map(([k, g]) => (
          <Chip key={k} pressed={profile.goal === k} onClick={() => updateProfile({ goal: k })}>
            <div className="font-display font-bold">{g.label}</div>
            <div className="text-sm text-muted">{g.sub}</div>
          </Chip>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Equipment
      </h2>
      <div className="grid gap-2">
        {EQUIP_OPTIONS.map((q) => (
          <Chip key={q.key} pressed={profile.equip.includes(q.key)} onClick={() => toggleEquip(q.key)}>
            <div className="font-display font-bold">{q.label}</div>
          </Chip>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Days a week
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {[2, 3, 4].map((n) => (
          <Chip key={n} pressed={profile.target === n} className="text-center" onClick={() => updateProfile({ target: n })}>
            <span className="font-display font-bold" style={{ fontSize: '1.3rem' }}>
              {n}
            </span>
          </Chip>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Your data
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">Everything is saved on this phone only. Export a copy any time.</p>
        <GhostButton className="mt-3" onClick={exportData}>
          Export data as JSON
        </GhostButton>
      </Card>

      <div className={`mt-3 rounded-card border-2 bg-card p-4 ${confirmReset ? 'border-warn' : 'border-line'}`}>
        {confirmReset ? (
          <>
            <p className="text-sm font-semibold text-warn">This deletes all workouts and progress on this phone. This can't be undone.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <GhostButton onClick={() => setConfirmReset(false)}>Cancel</GhostButton>
              <button
                type="button"
                className="min-h-[52px] w-full rounded-2xl bg-warn font-display text-xl font-bold text-chalk transition-transform active:scale-[0.98]"
                onClick={resetData}
              >
                Delete everything
              </button>
            </div>
          </>
        ) : (
          <GhostButton onClick={() => setConfirmReset(true)}>Reset all data</GhostButton>
        )}
      </div>
    </Wrap>
  )
}
