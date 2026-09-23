/** Optional contact details (Feature 5) — never a login wall, never blocks
 *  the app. Stored locally only; there is no backend in this build. */
export interface ContactProfile {
  firstName: string
  age: number | null
  contactMethod: 'phone' | 'email'
  contactValue: string
  consentedAt: number
}

const KEY = 'gymbuddy.profile'
const DISMISS_KEY = 'gymbuddy.profileCaptureDismissed'

export function getContactProfile(): ContactProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ContactProfile) : null
  } catch {
    return null
  }
}

export function saveContactProfile(data: Omit<ContactProfile, 'consentedAt'>): void {
  const record: ContactProfile = { ...data, consentedAt: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
  } catch {
    /* private mode / quota — the card just won't remember it was filled in */
  }
  // TODO(backend): once a backend exists, send `record` there (and decide
  // whether to keep a local copy at all). Deliberately not implemented here —
  // no backend in this build; the user asked to decide that separately.
}

export function deleteContactProfile(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function isProfileCaptureDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissProfileCapture(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* ignore */
  }
}
