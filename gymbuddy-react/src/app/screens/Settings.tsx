import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import { EQUIP_OPTIONS, GOALS } from '../../engine/goals'
import { AGE_BRACKET_LABEL, ageBracketFor, restReasonNote, warmupNote } from '../../engine/age'
import type { Equip, GoalKey } from '../../engine/types'
import { Wrap, Card, Chip, GhostButton } from '../components/ui'
import { deleteContactProfile, getContactProfile } from '../lib/contactProfile'

export default function Settings() {
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const events = useGym((s) => s.events)
  const updateProfile = useGym((s) => s.updateProfile)
  const resetData = useGym((s) => s.resetData)
  const [confirmReset, setConfirmReset] = useState(false)
  const [ageInput, setAgeInput] = useState(profile.age != null ? String(profile.age) : '')
  const [hasContactProfile, setHasContactProfile] = useState(() => getContactProfile() != null)
  const [detailsDeleted, setDetailsDeleted] = useState(false)

  const bracket = ageBracketFor(profile.age)

  function saveAge() {
    const trimmed = ageInput.trim()
    updateProfile({ age: trimmed === '' ? null : Number(trimmed) })
  }

  function clearAge() {
    setAgeInput('')
    updateProfile({ age: null })
  }

  function deleteDetails() {
    deleteContactProfile()
    setHasContactProfile(false)
    setDetailsDeleted(true)
  }

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
        Your age
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">Optional. Helps us adjust warm-up and recovery — never used for anything else, and you can clear it any time.</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={13}
            max={100}
            inputMode="numeric"
            className="w-24 rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            onBlur={saveAge}
            aria-label="Your age"
          />
          {profile.age != null && (
            <GhostButton onClick={clearAge} className="!min-h-0 w-auto px-4 py-2 text-sm">
              Clear
            </GhostButton>
          )}
        </div>
        {bracket && (
          <div className="mt-3 rounded-xl bg-plate/10 p-3 text-sm">
            <p className="font-semibold">Age group: {AGE_BRACKET_LABEL[bracket]}</p>
            {restReasonNote(bracket) && <p className="mt-1 text-muted">{restReasonNote(bracket)}</p>}
            {warmupNote(bracket) && <p className="mt-1 text-muted">{warmupNote(bracket)}</p>}
            {bracket === '40plus' && <p className="mt-1 text-muted">We'll lean toward machine/cable exercises and a lighter starting weight where there's a choice.</p>}
          </div>
        )}
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Reference
      </h2>
      <Card className="p-4">
        <Link to="/exercises" className="font-semibold underline decoration-line underline-offset-2">
          Browse all exercises →
        </Link>
        <p className="mt-1 text-sm text-muted">Search and filter the full library, with the same form guide shown mid-workout.</p>
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Your data
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">Everything is saved on this phone only. Export a copy any time.</p>
        <GhostButton className="mt-3" onClick={exportData}>
          Export data as JSON
        </GhostButton>
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Your details
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">
          Your name, age and contact info from the "save my progress" card, if you filled it in.{' '}
          <Link to="/privacy" className="underline decoration-line underline-offset-2">
            Read our privacy page
          </Link>
          .
        </p>
        {hasContactProfile ? (
          <GhostButton className="mt-3" onClick={deleteDetails}>
            Delete my details
          </GhostButton>
        ) : (
          <p className="mt-3 text-sm font-semibold text-muted">{detailsDeleted ? 'Deleted.' : 'Nothing saved.'}</p>
        )}
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
