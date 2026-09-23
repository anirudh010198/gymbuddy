import { useState } from 'react'
import { useAuthStore } from '../../lib/authStore'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { GhostButton } from './ui'

/** Google + email magic link — no phone OTP (that's a paid Supabase add-on).
 *  Shared between the post-onboarding AuthStep screen and Settings, so a
 *  user who skipped signing in once can still do it later, same UI. */
export default function SignInButtons() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)

  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setError(null)
    const res = await signInWithGoogle()
    if (!res.ok) setError(res.error ?? 'Could not start Google sign-in.')
  }

  async function handleEmail() {
    if (!email.trim()) return
    setError(null)
    setSending(true)
    const res = await signInWithEmail(email.trim())
    setSending(false)
    if (res.ok) setSent(true)
    else setError(res.error ?? 'Could not send the link.')
  }

  if (!isSupabaseConfigured) {
    return <p className="text-sm text-muted">Accounts aren't set up on this deployment yet — everything still works locally.</p>
  }

  if (sent) {
    return (
      <div>
        <p className="font-semibold">Check your email.</p>
        <p className="mt-1 text-sm text-muted">We sent a sign-in link to {email}. Open it on this device to finish.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <GhostButton onClick={handleGoogle}>Continue with Google</GhostButton>
      <div className="flex items-center gap-3 text-sm text-muted">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
          aria-label="Email address"
        />
      </label>
      <GhostButton disabled={!email.trim() || sending} onClick={handleEmail}>
        {sending ? 'Sending…' : 'Send me a sign-in link'}
      </GhostButton>
      {error && <p className="text-sm text-warn">{error}</p>}
    </div>
  )
}
