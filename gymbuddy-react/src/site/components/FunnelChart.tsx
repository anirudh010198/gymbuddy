export interface FunnelRow {
  label: string
  value: number | null
  base: number | null
}

function pct(value: number, base: number): string {
  return base ? `${Math.round((value / base) * 100)}%` : '–'
}

/** Single-series horizontal magnitude bars — one hue (plate) on a neutral
 *  track, matching the app's ProgressBar. No categorical palette needed
 *  since there's only one series; values are direct-labeled, not color-only. */
export default function FunnelChart({ rows }: { rows: FunnelRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0))

  return (
    <div className="grid gap-4">
      {rows.map((r) => {
        const widthPct = r.value != null ? (r.value / max) * 100 : 0
        return (
          <div key={r.label} title={r.value != null && r.base ? `${r.label}: ${r.value} (${pct(r.value, r.base)} of previous)` : r.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{r.label}</span>
              <span className="text-muted">{r.value ?? '–'}</span>
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-plate transition-[width]" style={{ width: `${widthPct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
