import { buildNudgeShareText, type Buddy, type BuddySource } from '../../engine/buddy'
import { shareText } from './share'

/** Shared by every "Nudge [name]" button (Home's inactivity prompt, the
 *  post-workout summary) — sends the encouraging message via the native
 *  share sheet / WhatsApp, then records it locally so the once-a-day cap
 *  (engine/buddy.ts canNudgeToday) actually holds across both entry points. */
export async function nudgeBuddy(
  buddySource: BuddySource,
  buddy: Buddy,
  trackEvent: (type: string, data?: Record<string, unknown>) => void,
): Promise<void> {
  await shareText(buildNudgeShareText(buddy.name))
  const updated: Buddy = { ...buddy, lastNudgeSentAt: Date.now() }
  buddySource.setBuddy(updated)
  trackEvent('buddy_nudge_sent', {})
}
