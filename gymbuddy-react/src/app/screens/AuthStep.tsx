import { useEffect } from 'react'
import { useAuthStore } from '../../lib/authStore'
import { useGym } from '../../store/GymStoreContext'
import { Wrap, PrimaryButton, Dock } from '../components/ui'
import SignInButtons from '../components/SignInButtons'

/** Shown once, right after onboarding finishes — never before, never
 *  blocking. The profile already exists by this point (see
 *  postOnboardingAuthPending in useGymStore), so skipping this screen loses
 *  nothing: it only ever offers to save progress that already works fine
 *  locally. */
export default function AuthStep() {
  const dismiss = useGym((s) => s.dismissPostOnboardingAuth)
  const user = useAuthStore((s) => s.user)

  // A successful sign-in (Google's redirect back, or a magic link opened in
  // this same tab) lands here with a session already restored — move on
  // automatically rather than making the user tap "Continue" after the fact.
  useEffect(() => {
    if (user) dismiss()
  }, [user, dismiss])

  return (
    <Wrap>
      <h1 className="mt-8 font-display font-extrabold leading-[0.95]" style={{ fontSize: '2.4rem' }}>
        Sign in to save your progress.
      </h1>
      <p className="mt-3 text-muted">
        Optional — your plan already works fully on this phone without it. Sign in to sync your history across devices too.
      </p>
      <div className="mt-6">
        <SignInButtons />
      </div>
      <Dock>
        <PrimaryButton onClick={dismiss}>Continue without an account</PrimaryButton>
      </Dock>
    </Wrap>
  )
}
