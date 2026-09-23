import { Link } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import { useBusySource } from '../../store/BusySourceContext'
import { gymStatusNow } from '../../engine/busyMap'
import PlateLogo from '../../site/components/PlateLogo'

/** Persistent across every /app screen (onboarding excepted — no profile to
 *  route to yet) so there's always a way out without the browser back
 *  button: the logo jumps to Today, the right-hand link leaves the app
 *  (or, in demo mode, exits back to the real landing page). The centre slot
 *  is a shortcut into the Rush Radar tab — a name (with a busy/quiet dot
 *  once there's data) or "Set your gym"; the actual gym picker lives on
 *  that tab now, not here. In demo mode a full-width "Demo data" bar always
 *  shows underneath, never confusable with a real account. */
export default function AppTopBar({
  showExitLink = true,
  demo = false,
}: {
  showExitLink?: boolean
  demo?: boolean
}) {
  const setPeekHome = useGym((s) => s.setPeekHome)
  const setActiveTab = useGym((s) => s.setActiveTab)
  const profile = useGym((s) => s.profile)
  const busySource = useBusySource()

  const gymCode = profile?.gymCode
  const status = gymCode ? gymStatusNow(busySource.all(gymCode)) : null

  function goToday() {
    setActiveTab('today')
    setPeekHome(true)
  }

  function goRushRadar() {
    setActiveTab('rush')
    setPeekHome(true)
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-[480px] items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={goToday}
          className="flex shrink-0 items-center gap-1.5 text-ink"
          aria-label="Go to Today"
        >
          <PlateLogo size={22} className="text-plate" />
          <span className="hidden font-display text-lg font-extrabold min-[400px]:inline">GymBuddy</span>
        </button>
        <button
          type="button"
          onClick={goRushRadar}
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-full border border-line px-2.5 py-1.5 text-sm font-semibold text-ink"
        >
          {status && (
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${status === 'busy' ? 'bg-warn' : 'bg-go'}`}
            />
          )}
          <span className="truncate">{profile?.gymName ?? 'Set your gym'}</span>
          {status && <span className="sr-only">{status === 'busy' ? ', busy right now' : ', quiet right now'}</span>}
        </button>
        {showExitLink && !demo && (
          <Link to="/" className="shrink-0 text-sm font-semibold text-muted hover:text-ink">
            Home
          </Link>
        )}
      </div>
      {demo && (
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-2 px-3 pb-2 sm:px-4">
          <span className="truncate rounded-full bg-plate px-2.5 py-1 text-xs font-bold text-plate-ink">
            Demo data — this is a sample account
          </span>
          <Link
            to="/"
            className="shrink-0 rounded-xl border-2 border-line px-3 py-1.5 text-xs font-bold text-ink hover:border-plate"
          >
            Exit demo
          </Link>
        </div>
      )}
    </div>
  )
}
