import { useEffect, useRef } from 'react'
import { useAuthStore } from '../../lib/authStore'
import { useGym } from '../../store/GymStoreContext'
import { pushHistory, pushProfile, reconcileHistoryOnSignIn } from '../../lib/cloudSync'
import { getContactProfile } from '../lib/contactProfile'

/** Headless — mounted once in AppRoot, for every /app screen. Bridges
 *  Supabase auth state to the local store, entirely as a side effect: the
 *  core store itself has no idea an account exists, so it keeps working
 *  exactly the same when signed out (or when Supabase isn't configured at
 *  all — every function this calls is already a no-op then). */
export default function SyncBridge() {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const profile = useGym((s) => s.profile)
  const history = useGym((s) => s.history)
  const setHistory = useGym((s) => s.setHistory)

  // Runs the full pull+merge+push reconcile once per sign-in, not on every
  // render/history change — re-running it on every keystroke-adjacent state
  // change would be wasteful (each step is itself idempotent, but there's no
  // reason to hit the network that often).
  const reconciledFor = useRef<string | null>(null)

  useEffect(() => {
    if (!userId || reconciledFor.current === userId) return
    reconciledFor.current = userId
    let cancelled = false
    ;(async () => {
      const merged = await reconcileHistoryOnSignIn(userId, history)
      if (!cancelled) setHistory(merged)
      const name = getContactProfile()?.firstName ?? null
      if (profile) await pushProfile(userId, profile, name)
    })()
    return () => {
      cancelled = true
    }
    // Only re-run when the signed-in user actually changes — history/profile
    // deliberately excluded, see the ref-guard above.
  }, [userId])

  // Incremental push while signed in: whenever local history grows (a
  // workout just finished) or the profile changes (Settings edit), mirror
  // it up. Re-uploading the whole small history array on every change is
  // simpler and just as correct as diffing, at this app's scale, and the
  // upsert-on-(user_id,date) means it's idempotent either way.
  const prevHistoryLength = useRef(history.length)
  useEffect(() => {
    if (!userId) {
      prevHistoryLength.current = history.length
      return
    }
    if (history.length !== prevHistoryLength.current) {
      prevHistoryLength.current = history.length
      void pushHistory(userId, history)
    }
  }, [userId, history])

  useEffect(() => {
    if (!userId || !profile) return
    const name = getContactProfile()?.firstName ?? null
    void pushProfile(userId, profile, name)
    // Only on a genuine profile change, not every render.
  }, [userId, profile])

  // "sync when back online" — the browser's own online event is the signal;
  // a full re-push is cheap at this scale and self-corrects anything a
  // failed request missed while offline (no separate retry queue needed).
  useEffect(() => {
    if (!userId) return
    function onOnline() {
      if (userId) void pushHistory(userId, history)
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [userId, history])

  return null
}
