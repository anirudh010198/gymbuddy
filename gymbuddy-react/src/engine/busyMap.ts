import type { Equip } from './types'

export interface BusyReport {
  exerciseId: string
  equipment: Equip
  gymCode: string
  dayOfWeek: number // 0=Sunday..6=Saturday, from Date#getDay()
  hourOfDay: number // 0-23, from Date#getHours()
}

/** Read/write behind a small interface so a future shared backend (the
 *  whole point of crowdsourced busy data — the CLAUDE.md "no backend" rule
 *  predates this feature) can swap in for `localBusySource` without
 *  touching any caller. Stored under its own gymbuddy.busy key, swept by
 *  the same hard reset as everything else (see lib/hardReset.ts). */
export interface BusySource {
  record(report: BusyReport): void
  all(gymCode: string): BusyReport[]
}

const STORAGE_KEY = 'gymbuddy.busy'

function readAll(): BusyReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as BusyReport[]) : []
  } catch {
    return []
  }
}

function writeAll(reports: BusyReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    /* private mode / storage unavailable — the report just isn't saved */
  }
}

export const localBusySource: BusySource = {
  record(report) {
    const all = readAll()
    all.push(report)
    // Cap growth — a rolling window is plenty for an hour-of-week forecast,
    // and this is local-only sample data, not a permanent record.
    writeAll(all.slice(-2000))
  },
  all(gymCode) {
    return readAll().filter((r) => r.gymCode === gymCode)
  },
}

/** In-memory-only source, e.g. for /demo — reports never touch the real
 *  visitor's gymbuddy.busy localStorage, same isolation as the demo's
 *  in-memory Zustand store. */
export function createMemoryBusySource(seed: BusyReport[] = []): BusySource {
  let reports = [...seed]
  return {
    record(report) {
      reports = [...reports, report]
    },
    all(gymCode) {
      return reports.filter((r) => r.gymCode === gymCode)
    },
  }
}

export function reportBusyNow(source: BusySource, gymCode: string, exerciseId: string, equipment: Equip, when = new Date()) {
  source.record({ exerciseId, equipment, gymCode, dayOfWeek: when.getDay(), hourOfDay: when.getHours() })
}

function countInBand(reports: BusyReport[], exerciseId: string, dayOfWeek: number, hourOfDay: number): number {
  return reports.filter((r) => r.exerciseId === exerciseId && r.dayOfWeek === dayOfWeek && r.hourOfDay === hourOfDay).length
}

export type BusyStatus = 'busy' | 'free'

export interface ForecastLine {
  exerciseId: string
  status: BusyStatus
  count: number
}

const BAND_THRESHOLD = 3

/** One line per exercise, only once there's enough data in THIS hour band to
 *  say anything honest — otherwise null, so the UI falls back to "still
 *  learning your gym's rush hours" instead of a confident-looking guess
 *  from a single report. */
export function forecastForSession(
  reports: BusyReport[],
  exerciseIds: string[],
  when = new Date(),
): ForecastLine[] | null {
  const dow = when.getDay()
  const hour = when.getHours()
  const counts = exerciseIds.map((id) => ({ id, count: countInBand(reports, id, dow, hour) }))
  const totalBand = counts.reduce((a, c) => a + c.count, 0)
  if (totalBand < BAND_THRESHOLD) return null
  return counts.map((c) => ({ exerciseId: c.id, status: c.count >= BAND_THRESHOLD ? 'busy' : 'free', count: c.count }))
}

/** A single exercise's status outside a full session forecast (e.g. a
 *  Change-exercise candidate that isn't part of today's session) — 'busy'
 *  needs the same 3+ band threshold as the session forecast; 'free' only
 *  needs SOME corroborating data (at least one report that hour, just none
 *  reaching "busy"), never fabricated from zero reports. */
export function statusFor(reports: BusyReport[], exerciseId: string, when = new Date()): BusyStatus | null {
  const count = countInBand(reports, exerciseId, when.getDay(), when.getHours())
  if (count >= BAND_THRESHOLD) return 'busy'
  if (count >= 1) return 'free'
  return null
}

/** A single "is the whole gym busy right now" signal for the top-bar
 *  indicator dot — 'busy' if any exercise has crossed the band threshold
 *  this hour, 'quiet' if there's some data this hour but nothing crossed
 *  it, and null (no dot — never a fabricated "quiet") when there's no data
 *  for this exact hour band at all. */
export function gymStatusNow(reports: BusyReport[], when = new Date()): 'busy' | 'quiet' | null {
  const dow = when.getDay()
  const hour = when.getHours()
  const bandReports = reports.filter((r) => r.dayOfWeek === dow && r.hourOfDay === hour)
  if (!bandReports.length) return null
  const counts = new Map<string, number>()
  for (const r of bandReports) counts.set(r.exerciseId, (counts.get(r.exerciseId) ?? 0) + 1)
  return [...counts.values()].some((c) => c >= BAND_THRESHOLD) ? 'busy' : 'quiet'
}

/** 5am-11pm x equipment heatmap cell counts, for /gym-rush. Grouped by
 *  equipment (not individual exercise) — hour-of-day only, not split by
 *  day-of-week too, since with realistically small sample sizes a day x
 *  hour x equipment cube would be almost all empty cells. */
export function heatmapFor(reports: BusyReport[]): { hours: number[]; countsByEquipment: Record<string, number[]> } {
  const hours = Array.from({ length: 19 }, (_, i) => i + 5) // 5..23
  const byEquipment: Record<string, number[]> = {}
  for (const r of reports) {
    const hourIx = hours.indexOf(r.hourOfDay)
    if (hourIx === -1) continue
    if (!byEquipment[r.equipment]) byEquipment[r.equipment] = new Array(hours.length).fill(0)
    byEquipment[r.equipment][hourIx]++
  }
  return { hours, countsByEquipment: byEquipment }
}
