import { Link } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import PlateLogo from '../../site/components/PlateLogo'

/** Persistent across every /app screen (onboarding excepted — no profile to
 *  route to yet) so there's always a way out without the browser back
 *  button: the logo jumps to Today, the exit link leaves the app. In demo
 *  mode (see pages/Demo.tsx) that link becomes "Exit demo" back to the real
 *  /app instead of "Home" to the landing page, and a persistent "Demo data"
 *  badge shows underneath — always-visible, never confusable with a real
 *  account. */
export default function AppTopBar({
  showExitLink = true,
  demo = false,
}: {
  showExitLink?: boolean
  demo?: boolean
}) {
  const setPeekHome = useGym((s) => s.setPeekHome)
  const setActiveTab = useGym((s) => s.setActiveTab)

  function goToday() {
    setActiveTab('today')
    setPeekHome(true)
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
        <button type="button" onClick={goToday} className="flex items-center gap-2 text-ink" aria-label="Go to Today">
          <PlateLogo size={24} className="text-plate" />
          <span className="font-display text-lg font-extrabold">GymBuddy</span>
        </button>
        {showExitLink && (
          <Link to={demo ? '/app' : '/'} className="text-sm font-semibold text-muted hover:text-ink">
            {demo ? 'Exit demo' : 'Home'}
          </Link>
        )}
      </div>
      {demo && (
        <div className="mx-auto max-w-[480px] px-4 pb-2">
          <span className="inline-block rounded-full bg-plate px-2.5 py-1 text-xs font-bold text-plate-ink">Demo data</span>
        </div>
      )}
    </div>
  )
}
