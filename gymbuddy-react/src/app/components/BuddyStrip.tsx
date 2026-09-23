import { useState } from 'react'
import { Card, GhostButton } from './ui'
import { buddyInactivityPrompt, canNudgeToday, type Buddy } from '../../engine/buddy'

/** The Today-screen buddy strip: their name, this week's count vs the
 *  user's own, and their streak — nothing about weights or how heavy
 *  either of them lifts, ever. Shows the 5-day inactivity nudge prompt
 *  inline when it applies. */
export default function BuddyStrip({
  buddy,
  myWeekCount,
  myTarget,
  onNudge,
  onManage,
}: {
  buddy: Buddy
  myWeekCount: number
  myTarget: number
  onNudge: () => Promise<void>
  onManage: () => void
}) {
  const [nudging, setNudging] = useState(false)
  const prompt = buddyInactivityPrompt(buddy)
  const canNudge = canNudgeToday(buddy)

  async function handleNudge() {
    setNudging(true)
    await onNudge()
    setNudging(false)
  }

  return (
    <Card className="mt-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Your buddy</div>
          <div className="font-display font-bold" style={{ fontSize: '1.3rem' }}>
            {buddy.name}
          </div>
          <div className="mt-0.5 text-sm text-muted">
            {buddy.workoutsThisWeek}/{buddy.weekTarget} this week · {buddy.streak} week streak
          </div>
        </div>
        <div className="text-right text-sm text-muted">
          You
          <br />
          <span className="font-display font-bold text-ink" style={{ fontSize: '1.2rem' }}>
            {myWeekCount}/{myTarget}
          </span>
        </div>
      </div>
      {prompt && (
        <div className="mt-3 rounded-xl bg-soft p-3">
          <p className="text-sm">{prompt}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={!canNudge || nudging}
              onClick={handleNudge}
              className="min-h-[36px] rounded-xl bg-plate px-3 text-sm font-bold text-plate-ink disabled:opacity-50"
            >
              {nudging ? 'Sending…' : !canNudge ? 'Already nudged today' : `Nudge ${buddy.name}`}
            </button>
          </div>
        </div>
      )}
      <GhostButton className="mt-3 !min-h-0 py-2 text-sm" onClick={onManage}>
        Manage buddy
      </GhostButton>
    </Card>
  )
}
