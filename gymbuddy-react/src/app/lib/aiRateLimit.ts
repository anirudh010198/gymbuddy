const KEY = 'gymbuddy.aiAskLimit'
export const DAILY_LIMIT = 10

interface LimitState {
  date: string
  count: number
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function read(): LimitState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as LimitState
      if (parsed.date === todayStr()) return parsed
    }
  } catch {
    /* ignore */
  }
  return { date: todayStr(), count: 0 }
}

/** Remaining questions the user can ask today (max 10/day, resets at local midnight). */
export function remainingAsksToday(): number {
  return Math.max(0, DAILY_LIMIT - read().count)
}

export function canAsk(): boolean {
  return remainingAsksToday() > 0
}

/** Call once per successful question asked. */
export function recordAsk(): void {
  const state = read()
  state.count += 1
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode — limit just resets each session, not a big deal for a cost guard */
  }
}
