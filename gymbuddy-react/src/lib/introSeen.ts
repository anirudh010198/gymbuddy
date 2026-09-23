const KEY = 'gymbuddy.introSeen'

/** The 3-card "what is GymBuddy" explainer shows once, ever, before
 *  onboarding — tracked independently of the profile/history blob so it
 *  survives being read before a store even exists yet. */
export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* private mode / storage unavailable — it'll just show again next time */
  }
}
