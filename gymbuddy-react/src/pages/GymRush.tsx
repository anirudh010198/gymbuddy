import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'
import { Link } from 'react-router-dom'
import { useGymStore } from '../store/useGymStore'
import { localBusySource, heatmapFor } from '../engine/busyMap'
import type { Equip } from '../engine/types'

const EQUIP_LABEL: Record<Equip, string> = {
  machine: 'Machines',
  cable: 'Cable station',
  dumbbell: 'Dumbbells',
  barbell: 'Barbells',
  bodyweight: 'Open floor / bodyweight',
}

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function GymRush() {
  const profile = useGymStore((s) => s.profile)
  const gymName = profile?.gymName
  const gymCode = profile?.gymCode
  const reports = gymCode ? localBusySource.all(gymCode) : []
  const { hours, countsByEquipment } = heatmapFor(reports)
  const equipKeys = Object.keys(countsByEquipment).sort() as Equip[]
  const max = Math.max(1, ...Object.values(countsByEquipment).flat())

  return (
    <div className="bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-4 pb-16 pt-8 sm:px-6">
        <h1 className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}>
          Gym rush hours
        </h1>
        <p className="mt-3 text-muted">
          Built entirely from "It's busy" taps during real workouts — never a camera or sensor, just what people reported
          seeing.
        </p>

        {!gymCode ? (
          <div className="mt-8 rounded-card border border-line bg-card p-5">
            <p className="font-semibold">No gym set yet.</p>
            <p className="mt-1 text-muted">
              Set your gym in the app to see (and contribute to) its rush-hour data.{' '}
              <Link to="/app" className="underline decoration-line underline-offset-2">
                Open the app →
              </Link>
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-8 rounded-card border border-line bg-card p-5">
            <p className="font-semibold">No reports yet for {gymName}.</p>
            <p className="mt-1 text-muted">Tap "It's busy" during a workout to start building this — it only takes a few taps.</p>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm font-semibold text-muted">
              {gymName} — based on {reports.length} report{reports.length === 1 ? '' : 's'} from this device.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-separate" style={{ borderSpacing: 2 }}>
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-bg p-1 text-left text-xs font-semibold text-muted">Equipment</th>
                    {hours.map((h) => (
                      <th key={h} className="p-1 text-center text-[0.65rem] font-semibold text-muted">
                        {h % 3 === 0 ? formatHour(h) : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {equipKeys.map((equip) => (
                    <tr key={equip}>
                      <th scope="row" className="sticky left-0 bg-bg p-1 text-left text-xs font-semibold">
                        {EQUIP_LABEL[equip]}
                      </th>
                      {countsByEquipment[equip].map((c, i) => (
                        <td key={i} className="p-0">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded text-[0.65rem] font-bold"
                            style={{
                              background: c > 0 ? `rgb(var(--plate-rgb) / ${0.15 + 0.75 * (c / max)})` : 'rgb(var(--line-rgb) / 0.3)',
                              color: c / max > 0.5 ? 'var(--plate-ink)' : undefined,
                            }}
                            title={`${EQUIP_LABEL[equip]}, ${formatHour(hours[i])}: ${c} report${c === 1 ? '' : 's'}`}
                          >
                            {c > 0 ? c : ''}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted">
              Darker cells had more "it's busy" reports at that hour. Small numbers — this is early data, treat it as a hint,
              not a guarantee.
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
