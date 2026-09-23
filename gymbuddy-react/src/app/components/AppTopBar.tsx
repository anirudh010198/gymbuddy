import { Link } from 'react-router-dom'
import { useGym } from '../../store/GymStoreContext'
import PlateLogo from '../../site/components/PlateLogo'

/** Persistent across every /app screen (onboarding excepted — no profile to
 *  route to yet) so there's always a way out without the browser back
 *  button: the logo jumps to Today, "Home" leaves the app for the landing
 *  page. `showExitLink=false` in the landing page's phone-frame demo, where
 *  leaving to "/" would be a no-op inside an already-embedded preview. */
export default function AppTopBar({ showExitLink = true }: { showExitLink?: boolean }) {
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
          <Link to="/" className="text-sm font-semibold text-muted hover:text-ink">
            Home
          </Link>
        )}
      </div>
    </div>
  )
}
