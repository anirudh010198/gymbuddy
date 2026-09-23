import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PlateLogo from './PlateLogo'
import FindGymSheet from '../../app/components/FindGymSheet'
import Toast from '../../app/components/Toast'
import { useGym } from '../../store/GymStoreContext'
import { setPendingGym } from '../../lib/pendingGym'

/** `showFindGym`: only the landing page passes this — a marketing-page
 *  entry point into the same gym picker used in the app's top bar and
 *  Settings, so a visitor can set their gym before ever opening /app. If
 *  they haven't onboarded yet (no profile to attach it to), the pick is
 *  parked via setPendingGym and applied automatically once they do. */
export default function SiteHeader({ showFindGym = false }: { showFindGym?: boolean }) {
  const location = useLocation()
  const profile = useGym((s) => s.profile)
  const updateProfile = useGym((s) => s.updateProfile)
  const trackEvent = useGym((s) => s.trackEvent)
  const [findGymOpen, setFindGymOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Already on the landing page: a Link to the same route is a no-op, so
  // scroll to top explicitly instead of just re-navigating nowhere.
  function handleLogoClick(e: React.MouseEvent) {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="relative mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 sm:px-6">
      <Toast message={toast} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px sm:inset-x-6"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--red) 20%, var(--red) 80%, transparent)',
          boxShadow: '0 0 10px var(--red-glow)',
        }}
      />
      <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 text-ink">
        <PlateLogo size={26} className="text-plate" />
        <span className="font-display text-xl font-extrabold">GymBuddy</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        {showFindGym && (
          <button
            type="button"
            onClick={() => setFindGymOpen(true)}
            className="hidden text-sm font-semibold text-muted hover:text-ink sm:inline"
          >
            {profile?.gymName ? profile.gymName : 'Find your gym'}
          </button>
        )}
        <Link to="/exercises" className="text-sm font-semibold text-muted hover:text-ink">
          Exercises
        </Link>
        <Link to="/case-study" className="text-sm font-semibold text-muted hover:text-ink">
          Case study
        </Link>
        <Link to="/app" className="rounded-xl bg-plate px-4 py-2 font-display text-sm font-bold text-plate-ink">
          Open app
        </Link>
      </nav>
      {showFindGym && (
        <FindGymSheet
          open={findGymOpen}
          onPick={(name, code, method) => {
            if (profile) {
              updateProfile({ gymName: name, gymCode: code })
            } else {
              setPendingGym(name, code)
              setToast("Saved — we'll set it up once you start")
            }
            trackEvent('gym_located', { method })
          }}
          onClose={() => setFindGymOpen(false)}
        />
      )}
    </header>
  )
}
