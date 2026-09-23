import { describe, expect, it } from 'vitest'
import {
  buddyInactivityPrompt,
  buildInviteLink,
  buildInviteShareText,
  canNudgeToday,
  createMemoryBuddySource,
  generateInviteCode,
  mySnapshot,
  nextNudgeAllowedDate,
  parseInvitePayload,
  type Buddy,
  type BuddySnapshot,
} from './buddy'
import type { HistoryEntry } from './types'

function makeBuddy(overrides: Partial<Buddy> = {}): Buddy {
  return {
    name: 'Priya',
    workoutsThisWeek: 1,
    weekTarget: 3,
    streak: 2,
    lastTrainedDate: '2026-09-18',
    code: 'ABCD23',
    pairedAt: Date.parse('2026-09-01'),
    lastNudgeSentAt: null,
    ...overrides,
  }
}

describe('generateInviteCode', () => {
  it('is 6 characters, and never contains ambiguous characters (0/O, 1/I/L)', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode()
      expect(code).toHaveLength(6)
      expect(code).not.toMatch(/[0OI1L]/)
    }
  })
})

describe('buddyInactivityPrompt', () => {
  it('is null when the buddy trained within the last 5 days', () => {
    const buddy = makeBuddy({ lastTrainedDate: '2026-09-20' })
    expect(buddyInactivityPrompt(buddy, '2026-09-24')).toBeNull() // 4 days
  })

  it('names the buddy once 5+ days have passed since their last workout', () => {
    const buddy = makeBuddy({ lastTrainedDate: '2026-09-19' })
    expect(buddyInactivityPrompt(buddy, '2026-09-24')).toBe("Priya hasn't trained this week. Send them a nudge?")
  })

  it('is null when there is no trained-date data at all (never invent a claim)', () => {
    const buddy = makeBuddy({ lastTrainedDate: null })
    expect(buddyInactivityPrompt(buddy, '2026-09-24')).toBeNull()
  })
})

describe('canNudgeToday / nextNudgeAllowedDate', () => {
  it('allows a nudge when none has ever been sent', () => {
    const buddy = makeBuddy({ lastNudgeSentAt: null })
    expect(canNudgeToday(buddy, '2026-09-24')).toBe(true)
    expect(nextNudgeAllowedDate(buddy)).toBeNull()
  })

  it('blocks a second nudge on the same calendar day', () => {
    const buddy = makeBuddy({ lastNudgeSentAt: new Date(2026, 8, 24, 9, 0).getTime() })
    expect(canNudgeToday(buddy, '2026-09-24')).toBe(false)
    expect(nextNudgeAllowedDate(buddy)).toBe('2026-09-25')
  })

  it('allows a nudge again the next calendar day', () => {
    const buddy = makeBuddy({ lastNudgeSentAt: new Date(2026, 8, 24, 23, 59).getTime() })
    expect(canNudgeToday(buddy, '2026-09-25')).toBe(true)
  })
})

describe('buildInviteLink / parseInvitePayload', () => {
  const snapshot: BuddySnapshot = { name: 'Anirudh', workoutsThisWeek: 2, weekTarget: 3, streak: 4, lastTrainedDate: '2026-09-22' }

  it('round-trips a snapshot through a link, including the role', () => {
    const link = buildInviteLink('https://gymbuddy-snowy.vercel.app', snapshot, 'AB3D9K', 'invite')
    const parsed = parseInvitePayload(link)
    expect(parsed).toEqual({ code: 'AB3D9K', role: 'invite', snapshot })
  })

  it('extracts the invite from inside a full pasted share message, not just a bare link', () => {
    const link = buildInviteLink('https://gymbuddy-snowy.vercel.app', snapshot, 'AB3D9K', 'invite')
    const shareText = buildInviteShareText('Anirudh', 'AB3D9K', link)
    const parsed = parseInvitePayload(`Forwarded:\n${shareText}\n\nsent via WhatsApp`)
    expect(parsed?.code).toBe('AB3D9K')
    expect(parsed?.snapshot.name).toBe('Anirudh')
  })

  it('tags a reply invite distinctly from an original one', () => {
    const link = buildInviteLink('https://gymbuddy-snowy.vercel.app', snapshot, 'ZZ9988', 'reply')
    expect(parseInvitePayload(link)?.role).toBe('reply')
  })

  it('returns null for text with no invite in it', () => {
    expect(parseInvitePayload('just a normal message, no invite here')).toBeNull()
  })
})

describe('mySnapshot', () => {
  it('never includes anything beyond week count, target, streak, and last-trained date', () => {
    const history: HistoryEntry[] = [
      { date: '2026-09-21', dayIndex: 0, sets: 12, reps: 100, volume: 5000, items: [], mins: 30 },
      { date: '2026-09-23', dayIndex: 1, sets: 12, reps: 100, volume: 5000, items: [], mins: 30 },
    ]
    const snap = mySnapshot('Anirudh', history, 3)
    expect(Object.keys(snap).sort()).toEqual(['lastTrainedDate', 'name', 'streak', 'weekTarget', 'workoutsThisWeek'].sort())
    expect(snap.lastTrainedDate).toBe('2026-09-23')
  })

  it('has a null last-trained date with no history yet', () => {
    expect(mySnapshot('Anirudh', [], 3).lastTrainedDate).toBeNull()
  })
})

describe('createMemoryBuddySource', () => {
  it('holds a seeded buddy and lets it be replaced or cleared, in memory only', () => {
    const seed = makeBuddy()
    const source = createMemoryBuddySource(seed)
    expect(source.getBuddy()).toEqual(seed)
    source.setBuddy(null)
    expect(source.getBuddy()).toBeNull()
  })

  it('starts empty with no seed, and tracks a pending invite separately', () => {
    const source = createMemoryBuddySource()
    expect(source.getBuddy()).toBeNull()
    expect(source.getMyInvite()).toBeNull()
    source.setMyInvite({ code: 'ABCD23', createdAt: 1 })
    expect(source.getMyInvite()).toEqual({ code: 'ABCD23', createdAt: 1 })
  })
})
