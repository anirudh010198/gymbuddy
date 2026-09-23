import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'
import { useGymStore } from '../store/useGymStore'
import { localBusySource } from '../engine/busyMap'
import RushRadarHeatmap from '../app/components/RushRadarHeatmap'

export default function GymRush() {
  const profile = useGymStore((s) => s.profile)
  const gymName = profile?.gymName
  const gymCode = profile?.gymCode
  const reports = gymCode ? localBusySource.all(gymCode) : []

  return (
    <div className="bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-4 pb-16 pt-8 sm:px-6">
        <h1 className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}>
          Rush Radar
        </h1>
        <p className="mt-3 text-muted">Know which machines are free before you walk in.</p>
        <p className="mt-1 text-sm text-muted">
          Built entirely from "It's busy" taps during real workouts — never a camera or sensor, just what people reported
          seeing.
        </p>
        <div className="mt-8">
          <RushRadarHeatmap gymName={gymName} gymCode={gymCode} reports={reports} openAppLinkIfSignedOut />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
