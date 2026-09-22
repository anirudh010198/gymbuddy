import type { TrackEvent } from './types'

const MAX_EVENTS = 400

/** Pure event-log append, capped at 400 entries (ported from js/app.js `track()`). */
export function appendEvent(events: TrackEvent[], type: string, data?: Record<string, unknown>): TrackEvent[] {
  const next = [...events, { t: Date.now(), type, ...(data ?? {}) }]
  return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next
}
