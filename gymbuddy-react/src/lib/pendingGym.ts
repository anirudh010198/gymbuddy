const KEY = 'gymbuddy.pendingGym'

/** A visitor can pick their gym from the landing page's nav before they've
 *  ever onboarded — there's no profile yet to attach it to (updateProfile
 *  is a no-op with no profile), so it's parked here instead and applied
 *  once completeOnboarding actually creates one. */
export function setPendingGym(name: string, code: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ name, code }))
  } catch {
    /* private mode / storage unavailable — the pick just won't carry over */
  }
}

/** Reads and clears in one step — a pending pick is meant to apply exactly
 *  once, to the very next onboarding. */
export function takePendingGym(): { name: string; code: string } | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    localStorage.removeItem(KEY)
    const parsed = JSON.parse(raw)
    if (typeof parsed?.name === 'string' && typeof parsed?.code === 'string') return parsed
    return null
  } catch {
    return null
  }
}
