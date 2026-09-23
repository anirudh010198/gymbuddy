import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import { EQUIP_OPTIONS, GOALS } from '../../engine/goals'
import {
  AGE_BRACKET_LABEL,
  ageBracketFor,
  restReasonNote,
  warmupNote,
  effortStyleForAge,
  EFFORT_STYLES,
  EFFORT_STYLE_LABEL,
  EFFORT_LEVEL_ORDER,
} from '../../engine/age'
import type { Equip, EffortStyle, GoalKey } from '../../engine/types'
import { Wrap, Card, Chip, GhostButton } from '../components/ui'
import { deleteContactProfile, getContactProfile } from '../lib/contactProfile'
import { useAuthStore } from '../../lib/authStore'
import { performHardReset } from '../../lib/hardReset'
import { useBuddySource } from '../../store/BuddySourceContext'
import SignInButtons from '../components/SignInButtons'
import Toast from '../components/Toast'
import BuddySheet from '../components/BuddySheet'

export default function Settings() {
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const events = useGym((s) => s.events)
  const updateProfile = useGym((s) => s.updateProfile)
  const showIntroAgain = useGym((s) => s.showIntroAgain)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const buddySource = useBuddySource()
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [ageInput, setAgeInput] = useState(profile.age != null ? String(profile.age) : '')
  const [bodyweightInput, setBodyweightInput] = useState(profile.bodyweightKg != null ? String(profile.bodyweightKg) : '')
  const [hasContactProfile, setHasContactProfile] = useState(() => getContactProfile() != null)
  const [detailsDeleted, setDetailsDeleted] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [buddySheetOpen, setBuddySheetOpen] = useState(false)
  const [buddy, setBuddy] = useState(() => buddySource.getBuddy())

  // Resetting the Zustand store alone left stale screens behind (other
  // localStorage keys untouched, a service worker that could still serve
  // old assets) — performHardReset clears all of it, and only a real
  // navigation (not client-side routing) reliably leaves no stale React
  // state anywhere, hence window.location rather than useNavigate.
  async function handleResetConfirm() {
    setResetting(true)
    setToast('Resetting…')
    await performHardReset()
    window.location.href = '/'
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    setDeleteAccountError(null)
    const res = await deleteAccount()
    if (!res.ok) {
      setDeletingAccount(false)
      setDeleteAccountError(res.error ?? 'Could not delete your account. Try again.')
      return
    }
    deleteContactProfile()
    setToast('Account deleted')
    // deleteAccount() already signed out — no need to do it again.
    await performHardReset({ signOut: false })
    window.location.href = '/'
  }

  const bracket = ageBracketFor(profile.age)
  const effortStyle: EffortStyle = profile.effortStyle ?? effortStyleForAge(bracket)

  function saveAge() {
    const trimmed = ageInput.trim()
    updateProfile({ age: trimmed === '' ? null : Number(trimmed) })
  }

  function clearAge() {
    setAgeInput('')
    updateProfile({ age: null })
  }

  function saveBodyweight() {
    const trimmed = bodyweightInput.trim()
    if (trimmed === '') {
      updateProfile({ bodyweightKg: null })
      return
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || parsed < 30 || parsed > 250) {
      setBodyweightInput(profile.bodyweightKg != null ? String(profile.bodyweightKg) : '')
      setToast('Enter a bodyweight between 30 and 250 kg.')
      return
    }
    updateProfile({ bodyweightKg: parsed })
  }

  function clearBodyweight() {
    setBodyweightInput('')
    updateProfile({ bodyweightKg: null })
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
      <Toast message={toast} />
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
        Buddy
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">
          Pair with one training partner — you'll each see the other's weekly progress and streak, never weights or how
          heavy either of you lifts.
        </p>
        {buddy ? (
          <>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-semibold">{buddy.name}</span>
              <span className="text-sm text-muted">
                {buddy.workoutsThisWeek}/{buddy.weekTarget} this week
              </span>
            </div>
            <GhostButton className="mt-3" onClick={() => setBuddySheetOpen(true)}>
              Manage buddy
            </GhostButton>
          </>
        ) : (
          <GhostButton className="mt-3" onClick={() => setBuddySheetOpen(true)}>
            Train with a buddy
          </GhostButton>
        )}
      </Card>

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
        <p className="text-sm text-muted">
          Sets your rest times, exercise selection and default effort-label style — never used for anything else, and you can
          change or clear it any time.
        </p>
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
        Your bodyweight
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">
          Optional — only used to estimate total volume for bodyweight exercises (push-ups, pull-ups, etc.), which otherwise
          have no weight to count. Defaults to 70kg when not set.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={30}
            max={250}
            inputMode="numeric"
            className="w-24 rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
            value={bodyweightInput}
            onChange={(e) => setBodyweightInput(e.target.value)}
            onBlur={saveBodyweight}
            aria-label="Your bodyweight in kilograms"
          />
          <span className="text-muted">kg</span>
          {profile.bodyweightKg != null && (
            <GhostButton onClick={clearBodyweight} className="!min-h-0 w-auto px-4 py-2 text-sm">
              Clear
            </GhostButton>
          )}
        </div>
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Effort labels
      </h2>
      <p className="mb-2 text-sm text-muted">
        How the post-set effort chips are worded — the same four levels underneath, whichever style you pick.
      </p>
      <div className="grid gap-2">
        {(Object.keys(EFFORT_STYLES) as EffortStyle[]).map((style) => (
          <Chip key={style} pressed={effortStyle === style} onClick={() => updateProfile({ effortStyle: style })}>
            <div className="font-display font-bold">{EFFORT_STYLE_LABEL[style]}</div>
            <div className="mt-1 text-sm text-muted">
              {EFFORT_LEVEL_ORDER.map((k) => `${EFFORT_STYLES[style][k].emoji} ${EFFORT_STYLES[style][k].label}`).join(' · ')}
            </div>
          </Chip>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Account
      </h2>
      <Card className="p-4">
        {user ? (
          <>
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-semibold">{user.email}</p>
            <p className="mt-2 text-sm text-muted">Your history syncs to your account and stays cached on this phone for offline use.</p>
            <GhostButton className="mt-3" onClick={signOut}>
              Sign out
            </GhostButton>
            <div className={`mt-3 rounded-card border-2 p-3 ${confirmDeleteAccount ? 'border-warn' : 'border-line'}`}>
              {confirmDeleteAccount ? (
                <>
                  <p className="text-sm font-semibold text-warn">
                    This permanently deletes your account and every synced workout. This can't be undone.
                  </p>
                  {deleteAccountError && <p className="mt-2 text-sm text-warn">{deleteAccountError}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <GhostButton onClick={() => setConfirmDeleteAccount(false)} disabled={deletingAccount}>
                      Cancel
                    </GhostButton>
                    <button
                      type="button"
                      disabled={deletingAccount}
                      className="min-h-[52px] w-full rounded-2xl bg-warn font-display text-xl font-bold text-chalk transition-transform active:scale-[0.98] disabled:opacity-60"
                      onClick={handleDeleteAccount}
                    >
                      {deletingAccount ? 'Deleting…' : 'Delete account'}
                    </button>
                  </div>
                </>
              ) : (
                <GhostButton onClick={() => setConfirmDeleteAccount(true)}>Delete my account and data</GhostButton>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Not signed in. Your progress is saved on this phone only —{' '}
              <Link to="/privacy" className="underline decoration-line underline-offset-2">
                read our privacy page
              </Link>{' '}
              for what changes if you sign in.
            </p>
            <div className="mt-3">
              <SignInButtons />
            </div>
          </>
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
        <button
          type="button"
          className="mt-3 text-sm font-semibold underline decoration-line underline-offset-2"
          onClick={showIntroAgain}
        >
          Show intro again
        </button>
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.3rem' }}>
        Your data
      </h2>
      <Card className="p-4">
        <p className="text-sm text-muted">
          {user ? 'Synced to your account and cached on this phone.' : 'Everything is saved on this phone only.'} Export a copy
          any time.
        </p>
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
            <p className="text-sm font-semibold text-warn">
              This deletes your workouts, streaks and settings on this device. This can't be undone.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <GhostButton onClick={() => setConfirmReset(false)} disabled={resetting}>
                Cancel
              </GhostButton>
              <button
                type="button"
                disabled={resetting}
                className="min-h-[52px] w-full rounded-2xl bg-warn font-display text-xl font-bold text-chalk transition-transform active:scale-[0.98] disabled:opacity-60"
                onClick={handleResetConfirm}
              >
                {resetting ? 'Resetting…' : 'Delete everything'}
              </button>
            </div>
          </>
        ) : (
          <GhostButton onClick={() => setConfirmReset(true)}>Reset all data</GhostButton>
        )}
      </div>
      <BuddySheet
        open={buddySheetOpen}
        onClose={() => {
          setBuddySheetOpen(false)
          setBuddy(buddySource.getBuddy())
        }}
      />
    </Wrap>
  )
}
