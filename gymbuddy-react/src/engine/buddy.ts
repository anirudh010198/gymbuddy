import { addDays, parseDate, today, weekStart } from './dates'
import { streakWeeks, weekCount } from './streak'
import type { HistoryEntry } from './types'

/** Only what's needed to show the buddy strip: never weights, never how
 *  heavy they lift — just enough to feel accountable, not judged. */
/** What gets shared with a buddy: this week's count, target, streak, and
 *  last-trained date only — the same figures already on the Today screen,
 *  never a single exercise, set, or weight. */
export function mySnapshot(name: string, history: HistoryEntry[], target: number): BuddySnapshot {
  return {
    name,
    workoutsThisWeek: weekCount(history, weekStart(today())),
    weekTarget: target,
    streak: streakWeeks(history, target),
    lastTrainedDate: history.length ? history[history.length - 1].date : null,
  }
}

export interface BuddySnapshot {
  name: string
  workoutsThisWeek: number
  weekTarget: number
  streak: number
  /** ISO date (YYYY-MM-DD) of their last completed workout, or null if
   *  they haven't trained since pairing — drives the 5-day nudge prompt. */
  lastTrainedDate: string | null
}

export interface Buddy extends BuddySnapshot {
  code: string
  pairedAt: number
  /** When *I* last nudged them — drives the once-a-day cap. */
  lastNudgeSentAt?: number | null
}

export interface MyInvite {
  code: string
  createdAt: number
}

/** Local now, behind this interface, so a future shared backend (real-time
 *  buddy stats, push-delivered nudges) can swap in without touching any
 *  caller — same pattern as engine/busyMap.ts's BusySource. */
export interface BuddySource {
  getBuddy(): Buddy | null
  setBuddy(buddy: Buddy | null): void
  getMyInvite(): MyInvite | null
  setMyInvite(invite: MyInvite | null): void
}

const BUDDY_KEY = 'gymbuddy.buddy'
const INVITE_KEY = 'gymbuddy.buddy.invite'

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / storage unavailable */
  }
}

export const localBuddySource: BuddySource = {
  getBuddy: () => readJSON<Buddy>(BUDDY_KEY),
  setBuddy: (buddy) => writeJSON(BUDDY_KEY, buddy),
  getMyInvite: () => readJSON<MyInvite>(INVITE_KEY),
  setMyInvite: (invite) => writeJSON(INVITE_KEY, invite),
}

/** In-memory-only source for /demo — a seeded buddy never touches the real
 *  visitor's gymbuddy.buddy data, same isolation as BusySource's demo variant. */
export function createMemoryBuddySource(seedBuddy: Buddy | null = null): BuddySource {
  let buddy = seedBuddy
  let invite: MyInvite | null = null
  return {
    getBuddy: () => buddy,
    setBuddy: (b) => {
      buddy = b
    },
    getMyInvite: () => invite,
    setMyInvite: (i) => {
      invite = i
    },
  }
}

// Excludes 0/O and 1/I/L — easy to misread aloud or mistype at a gym.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateInviteCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return code
}

export function buildInviteShareText(myName: string, code: string, link: string): string {
  return `${myName} wants to be your GymBuddy 💪 Use code ${code} or just open this link to pair up: ${link}`
}

export function buildNudgeShareText(buddyName: string): string {
  return `Hey ${buddyName}, it's your GymBuddy nudge — let's get a workout in today! 💪`
}

export type InviteRole = 'invite' | 'reply'

/** No backend to look a bare 6-character code up against, so the code alone
 *  can't carry data — the link is what actually carries the sender's
 *  snapshot (name, week progress, streak), with the code just there as a
 *  human-friendly, readable-aloud label for the same link. `role`
 *  distinguishes an original invite from the "send this back" reply that
 *  completes a mutual pairing (see BuddySheet) — a reply never prompts
 *  another reply, which is what stops the handshake looping forever. */
export function buildInviteLink(origin: string, snapshot: BuddySnapshot, code: string, role: InviteRole): string {
  const params = new URLSearchParams({
    buddyCode: code,
    buddyName: snapshot.name,
    buddyWeek: String(snapshot.workoutsThisWeek),
    buddyTarget: String(snapshot.weekTarget),
    buddyStreak: String(snapshot.streak),
    buddyLast: snapshot.lastTrainedDate ?? '',
    buddyRole: role,
  })
  return `${origin}/app?${params.toString()}`
}

export interface ParsedInvite {
  code: string
  snapshot: BuddySnapshot
  role: InviteRole
}

/** Pulls a buddy invite out of a pasted link OR a whole pasted share
 *  message containing one (WhatsApp forwards often include surrounding
 *  text) — searches for the query string anywhere in the input rather
 *  than requiring an exact URL match. */
export function parseInvitePayload(text: string): ParsedInvite | null {
  const match = text.match(/buddyCode=[^\s]+/)
  if (!match) return null
  // Whatever came after the match, up to the next whitespace, is the query string.
  const queryStart = text.lastIndexOf('?', text.indexOf(match[0]))
  const querySlice = queryStart >= 0 ? text.slice(queryStart + 1) : match[0]
  const endOfQuery = querySlice.search(/\s/)
  const params = new URLSearchParams(endOfQuery === -1 ? querySlice : querySlice.slice(0, endOfQuery))
  const code = params.get('buddyCode')
  const name = params.get('buddyName')
  if (!code || !name) return null
  const role: InviteRole = params.get('buddyRole') === 'reply' ? 'reply' : 'invite'
  return {
    code,
    role,
    snapshot: {
      name,
      workoutsThisWeek: Number(params.get('buddyWeek') ?? 0),
      weekTarget: Number(params.get('buddyTarget') ?? 3),
      streak: Number(params.get('buddyStreak') ?? 0),
      lastTrainedDate: params.get('buddyLast') || null,
    },
  }
}

/** Whole days since a date string, floored — used for the 5-day inactivity
 *  threshold. Always >= 0 for a past date. */
function daysSince(dateStr: string, from = today()): number {
  const ms = parseDate(from).getTime() - parseDate(dateStr).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

/** The 5-day "hasn't trained" prompt — null (no nudge prompt) if they've
 *  trained recently or never trained data exists yet to judge from. */
export function buddyInactivityPrompt(buddy: Buddy, from = today()): string | null {
  if (!buddy.lastTrainedDate) return null
  if (daysSince(buddy.lastTrainedDate, from) < 5) return null
  return `${buddy.name} hasn't trained this week. Send them a nudge?`
}

function dateStrOf(epochMs: number): string {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Once per calendar day, not a rolling 24h window — matches how every
 *  other "today" concept in this app works (see engine/dates.ts). */
export function canNudgeToday(buddy: Buddy, from = today()): boolean {
  if (!buddy.lastNudgeSentAt) return true
  return dateStrOf(buddy.lastNudgeSentAt) !== from
}

export function nextNudgeAllowedDate(buddy: Buddy): string | null {
  if (!buddy.lastNudgeSentAt) return null
  return addDays(dateStrOf(buddy.lastNudgeSentAt), 1)
}
