import { addDays, today, weekStart } from './dates'
import type { HistoryEntry } from './types'

export function weekCount(history: HistoryEntry[], ws: string): number {
  return new Set(history.filter((h) => weekStart(h.date) === ws).map((h) => h.date)).size
}

/**
 * Consecutive weeks meeting `target` workouts. The current week counts once
 * it meets target, but never breaks the streak while it's still in progress
 * (ported 1:1 from js/app.js `streakWeeks`).
 */
export function streakWeeks(history: HistoryEntry[], target: number, todayStr: string = today()): number {
  let ws = weekStart(todayStr)
  let n = 0
  if (weekCount(history, ws) >= target) n++
  ws = addDays(ws, -7)
  while (weekCount(history, ws) >= target) {
    n++
    ws = addDays(ws, -7)
  }
  return n
}

export function trainedToday(history: HistoryEntry[], todayStr: string = today()): boolean {
  return history.some((h) => h.date === todayStr)
}
