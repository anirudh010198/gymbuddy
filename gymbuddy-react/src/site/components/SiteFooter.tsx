import { Link } from 'react-router-dom'
import PlateLogo from './PlateLogo'

export default function SiteFooter() {
  return (
    <footer className="bg-rubber py-10 text-chalk">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <PlateLogo size={22} className="text-plate" />
          <span className="font-display text-lg font-bold">GymBuddy</span>
        </div>
        <p className="mt-4 max-w-[560px] text-sm text-[#9FB0B4]">
          GymBuddy gives general guidance for healthy adults. Stop if you feel sharp or joint pain, and ask a qualified trainer
          or doctor.
        </p>
        <p className="mt-4 text-xs text-[#9FB0B4]">
          Built for the PML Product Challenge. <Link to="/privacy" className="underline decoration-[#5B6B70] underline-offset-2">Privacy</Link>
        </p>
      </div>
    </footer>
  )
}
