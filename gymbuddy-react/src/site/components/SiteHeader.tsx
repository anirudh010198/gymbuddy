import { Link } from 'react-router-dom'
import PlateLogo from './PlateLogo'

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-ink">
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
