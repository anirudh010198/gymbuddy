import { Link } from 'react-router-dom'
import { heatmapFor, type BusyReport } from '../../engine/busyMap'
import { EQUIP_LABEL } from '../../engine/equip'
import type { Equip } from '../../engine/types'

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

/** The 5am-11pm x equipment heatmap, with its own honest empty states —
 *  shared by the in-app Rush Radar tab and the standalone /gym-rush page,
 *  so both read the same real data the same way. */
export default function RushRadarHeatmap({
  gymName,
  gymCode,
  reports,
  openAppLinkIfSignedOut = false,
}: {
  gymName?: string | null
  gymCode?: string | null
  reports: BusyReport[]
  /** Only the standalone page needs this — a visitor with no gym set yet
   *  has no in-app tab to point to instead. */
  openAppLinkIfSignedOut?: boolean
}) {
  const { hours, countsByEquipment } = heatmapFor(reports)
  const equipKeys = Object.keys(countsByEquipment).sort() as Equip[]
  const max = Math.max(1, ...Object.values(countsByEquipment).flat())

  if (!gymCode) {
    return (
      <div className="rounded-card border border-line bg-card p-5">
        <p className="font-semibold">No gym set yet.</p>
        <p className="mt-1 text-muted">
          {openAppLinkIfSignedOut ? (
            <>
              Set your gym in the app to see (and contribute to) its rush-hour data.{' '}
              <Link to="/app" className="underline decoration-line underline-offset-2">
                Open the app →
              </Link>
            </>
          ) : (
            'Set your gym above to see (and contribute to) its rush-hour data.'
          )}
        </p>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-card border border-line bg-card p-5">
        <p className="font-semibold">No reports yet for {gymName}.</p>
        <p className="mt-1 text-muted">Tap "It's busy" during a workout to start building this — it only takes a few taps.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm font-semibold text-muted">
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
        Darker cells had more "it's busy" reports at that hour. Small numbers — this is early data, treat it as a hint, not a
        guarantee.
      </p>
    </>
  )
}
