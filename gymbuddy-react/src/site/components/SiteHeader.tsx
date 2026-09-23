import { Link, useLocation } from 'react-router-dom'
import PlateLogo from './PlateLogo'

export default function SiteHeader() {
  const location = useLocation()

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
      <nav className="flex items-center gap-4">
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
    </header>
  )
}
