import { useAuthStore } from './authStore'

/** The full "actually clear everything" reset — used by both Settings'
 *  "Reset all data" and "Delete my account and data". Resetting the
 *  Zustand store alone (the old behaviour) left two kinds of stale state
 *  behind: other localStorage keys (gymbuddy.v1 is only the core store —
 *  gymbuddy.team, the contact-profile keys, and anything future all need
 *  clearing too, hence the prefix sweep below instead of a hardcoded list),
 *  and a PWA service worker that could keep serving whatever it already had
 *  cached. A hard reload to "/" after this is what actually gets the screen
 *  itself unstuck — and it's also why this deliberately does NOT call the
 *  live store's resetData(): every caller navigates away right after this
 *  resolves, and setting profile to null on the still-mounted Settings
 *  screen (which assumes a signed-in-to-a-profile user, `profile!`) crashed
 *  it with a null read before the navigation had a chance to unmount it.
 *  Clearing storage and reloading is what the fresh page picks up instead —
 *  no in-memory state needs to change on the page that's about to leave. */
export async function performHardReset(opts: { signOut?: boolean } = {}): Promise<void> {
  if (opts.signOut !== false) {
    try {
      await useAuthStore.getState().signOut()
    } catch {
      /* not configured, or already signed out — either way, keep going */
    }
  }

  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('gymbuddy.')) localStorage.removeItem(key)
    }
  } catch {
    /* private mode / storage unavailable — nothing to clear */
  }

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* service worker / cache APIs unavailable — nothing more to clear */
  }
}
