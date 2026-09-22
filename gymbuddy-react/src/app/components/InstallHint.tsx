import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../lib/useInstallPrompt'

const SEEN_KEY = 'gymbuddy.installHintSeen'

function hasSeenIt(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/** Shown once, only after the user's first completed workout (per CLAUDE.md
 *  4.2.7) — never on first launch, when it'd just be noise before they've
 *  seen any value. */
export default function InstallHint({ eligible }: { eligible: boolean }) {
  const { installed, canPrompt, isIOS, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(hasSeenIt)

  const show = eligible && !installed && !dismissed && (canPrompt || isIOS)

  useEffect(() => {
    if (!show) return
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* private mode — hint just reappears next session, not a big deal */
    }
  }, [show])

  if (!show) return null

  return (
    <div className="mt-4 flex items-start justify-between gap-3 rounded-card border border-line bg-card p-4">
      <div>
        <div className="font-display font-bold" style={{ fontSize: '1.05rem' }}>
          Add GymBuddy to your home screen
        </div>
        <p className="mt-1 text-sm text-muted">
          {canPrompt ? 'Opens instantly, works offline, no app store.' : 'Tap the Share icon, then "Add to Home Screen".'}
        </p>
        {canPrompt && (
          <button type="button" className="mt-3 rounded-xl bg-plate px-3 py-2 text-sm font-bold text-plate-ink" onClick={promptInstall}>
            Add to Home Screen
          </button>
        )}
      </div>
      <button type="button" aria-label="Dismiss" className="text-lg leading-none text-muted" onClick={() => setDismissed(true)}>
        ✕
      </button>
    </div>
  )
}
