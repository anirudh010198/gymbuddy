import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet'
import { PrimaryButton, GhostButton, Card } from './ui'
import { useGym } from '../../store/GymStoreContext'
import { useBuddySource } from '../../store/BuddySourceContext'
import {
  buildInviteLink,
  buildInviteShareText,
  generateInviteCode,
  mySnapshot,
  parseInvitePayload,
  type Buddy,
  type ParsedInvite,
} from '../../engine/buddy'
import { getMyBuddyName, setMyBuddyName } from '../../lib/myBuddyName'
import { shareText } from '../lib/share'

type Step = 'menu' | 'name' | 'inviting' | 'paste' | 'accept-confirm' | 'accepted-share-back' | 'paired' | 'unpair-confirm'

/** "Train with a buddy" — the whole invite/accept/manage flow in one sheet,
 *  mounted independently in both Home (Today) and Settings per spec. No
 *  backend to look a bare code up against, so the actual data (name, week
 *  progress, streak) travels in the share link/message itself — see
 *  engine/buddy.ts for the full reasoning. `incomingInvite` is only passed
 *  by the one caller that also reads the URL (Home), so opening a shared
 *  link always resumes straight into the accept step. */
export default function BuddySheet({
  open,
  onClose,
  incomingInvite,
  onIncomingHandled,
}: {
  open: boolean
  onClose: () => void
  incomingInvite?: ParsedInvite | null
  onIncomingHandled?: () => void
}) {
  const profile = useGym((s) => s.profile)!
  const history = useGym((s) => s.history)
  const trackEvent = useGym((s) => s.trackEvent)
  const buddySource = useBuddySource()

  const existingBuddy = buddySource.getBuddy()
  const [step, setStep] = useState<Step>(() => {
    if (incomingInvite) return 'accept-confirm'
    if (existingBuddy) return 'paired'
    return 'menu'
  })
  const [nameInput, setNameInput] = useState(getMyBuddyName())
  const [pasteInput, setPasteInput] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [pendingAccept, setPendingAccept] = useState<ParsedInvite | null>(incomingInvite ?? null)
  const [invite, setInvite] = useState(() => buddySource.getMyInvite())
  const [buddy, setBuddyState] = useState<Buddy | null>(existingBuddy)
  const [copied, setCopied] = useState(false)
  // Which action the "what's your name?" step should resume into once a
  // name is confirmed — inviting for the first time and replying to
  // complete a pairing both need a name, but lead to different next steps.
  const [pendingNameAction, setPendingNameAction] = useState<'invite' | 'reply'>('invite')

  // This component stays mounted (only `open` toggles, see how it's
  // rendered in Home/Settings) — re-derive the right starting step every
  // time it opens (the rising edge only: once mid-flow, e.g. accepting an
  // invite clears the URL params via onIncomingHandled, which must NOT
  // reset an already-open sheet back to its starting step).
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      const b = buddySource.getBuddy()
      setBuddyState(b)
      setInvite(buddySource.getMyInvite())
      if (incomingInvite) {
        setPendingAccept(incomingInvite)
        setStep('accept-confirm')
      } else {
        setStep(b ? 'paired' : 'menu')
      }
    }
    wasOpen.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, incomingInvite])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  function handleClose() {
    onClose()
    // Reset to whatever's actually true, not whatever step we ended on.
    window.setTimeout(() => {
      const b = buddySource.getBuddy()
      setBuddyState(b)
      setStep(b ? 'paired' : 'menu')
      setPasteInput('')
      setPasteError(null)
      setCopied(false)
    }, 200)
  }

  function startInvite() {
    if (!getMyBuddyName().trim()) {
      setPendingNameAction('invite')
      setStep('name')
      return
    }
    generateAndShowInvite()
  }

  function generateAndShowInvite() {
    const existing = buddySource.getMyInvite()
    const code = existing?.code ?? generateInviteCode()
    const newInvite = { code, createdAt: existing?.createdAt ?? Date.now() }
    buddySource.setMyInvite(newInvite)
    setInvite(newInvite)
    setStep('inviting')
  }

  function confirmName() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setMyBuddyName(trimmed)
    if (pendingNameAction === 'reply') sendReply(trimmed)
    else generateAndShowInvite()
  }

  async function shareInvite() {
    if (!invite) return
    const name = getMyBuddyName()
    const snapshot = mySnapshot(name, history, profile.target)
    const link = buildInviteLink(origin, snapshot, invite.code, 'invite')
    await shareText(buildInviteShareText(name, invite.code, link))
  }

  async function copyInviteLink() {
    if (!invite) return
    const name = getMyBuddyName()
    const snapshot = mySnapshot(name, history, profile.target)
    const link = buildInviteLink(origin, snapshot, invite.code, 'invite')
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — the share button still works */
    }
  }

  function handlePaste() {
    setPasteError(null)
    const parsed = parseInvitePayload(pasteInput)
    if (!parsed) {
      setPasteError("That doesn't look like a GymBuddy invite. Ask them to send their invite link.")
      return
    }
    setPendingAccept(parsed)
    setStep('accept-confirm')
  }

  function acceptInvite() {
    if (!pendingAccept) return
    const newBuddy: Buddy = { ...pendingAccept.snapshot, code: pendingAccept.code, pairedAt: Date.now(), lastNudgeSentAt: null }
    buddySource.setBuddy(newBuddy)
    setBuddyState(newBuddy)
    trackEvent('buddy_paired', { role: pendingAccept.role === 'reply' ? 'inviter' : 'acceptor' })
    onIncomingHandled?.()
    // A reply invite (the "send this back" step below) completes the
    // handshake — no further reply needed, or the two sides would keep
    // bouncing invites at each other forever.
    setStep(pendingAccept.role === 'reply' ? 'paired' : 'accepted-share-back')
  }

  function declineInvite() {
    setPendingAccept(null)
    onIncomingHandled?.()
    setStep(buddy ? 'paired' : 'menu')
  }

  function shareBackReply() {
    if (!getMyBuddyName().trim()) {
      setPendingNameAction('reply')
      setStep('name')
      return
    }
    void sendReply(getMyBuddyName())
  }

  async function sendReply(name: string) {
    if (!buddy) return
    const snapshot = mySnapshot(name, history, profile.target)
    const code = generateInviteCode()
    const link = buildInviteLink(origin, snapshot, code, 'reply')
    await shareText(buildInviteShareText(name, code, link))
    handleClose()
  }

  function unpair() {
    buddySource.setBuddy(null)
    buddySource.setMyInvite(null)
    setBuddyState(null)
    setInvite(null)
    setStep('menu')
  }

  const myName = getMyBuddyName() || 'You'
  const myWeekCount = mySnapshot(myName, history, profile.target).workoutsThisWeek

  return (
    <Sheet open={open} onClose={handleClose}>
      {step === 'menu' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Train with a buddy
          </h2>
          <p className="mb-4 text-muted">
            7 in 10 people say a gym partner helps them push through the hard days. Pair up — no weights or how heavy you lift
            are ever shared, just whether you showed up.
          </p>
          <div className="grid gap-3">
            <PrimaryButton onClick={startInvite}>Invite a buddy</PrimaryButton>
            <GhostButton onClick={() => setStep('paste')}>I have an invite</GhostButton>
          </div>
        </>
      )}

      {step === 'name' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            What's your name?
          </h2>
          <p className="mb-4 text-muted">Shown to your buddy so they know who's inviting them.</p>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
            placeholder="Your first name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            aria-label="Your name"
            autoFocus
          />
          <PrimaryButton className="mt-4" disabled={!nameInput.trim()} onClick={confirmName}>
            Continue
          </PrimaryButton>
        </>
      )}

      {step === 'inviting' && invite && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Your invite
          </h2>
          <p className="mb-4 text-muted">Share this with your buddy. Once they open it and accept, you'll both be paired.</p>
          <div className="rounded-2xl border-2 border-plate/50 bg-plate/10 p-4 text-center">
            <div data-testid="invite-code" className="font-display font-extrabold tracking-[0.3em]" style={{ fontSize: '2rem' }}>
              {invite.code}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <PrimaryButton onClick={shareInvite}>Share invite</PrimaryButton>
            <GhostButton onClick={copyInviteLink}>{copied ? 'Link copied!' : 'Copy link instead'}</GhostButton>
          </div>
        </>
      )}

      {step === 'paste' && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Enter their invite
          </h2>
          <p className="mb-4 text-muted">Paste the code, link, or the whole message they sent you.</p>
          <textarea
            className="min-h-[90px] w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
            placeholder="Paste it here"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            aria-label="Their invite"
            autoFocus
          />
          {pasteError && <p className="mt-2 text-sm text-warn">{pasteError}</p>}
          <PrimaryButton className="mt-4" disabled={!pasteInput.trim()} onClick={handlePaste}>
            Continue
          </PrimaryButton>
        </>
      )}

      {step === 'accept-confirm' && pendingAccept && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Pair with {pendingAccept.snapshot.name}?
          </h2>
          <p className="mb-4 text-muted">
            You'll see each other's weekly progress and streak — never weights or how heavy either of you lifts. You can unpair
            any time.
          </p>
          <div className="grid gap-3">
            <PrimaryButton onClick={acceptInvite}>Pair up</PrimaryButton>
            <GhostButton onClick={declineInvite}>Not now</GhostButton>
          </div>
        </>
      )}

      {step === 'accepted-share-back' && buddy && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            You're paired with {buddy.name}!
          </h2>
          <p className="mb-4 text-muted">One last step — send this back so they see you too.</p>
          <div className="grid gap-3">
            <PrimaryButton onClick={shareBackReply}>Send it back</PrimaryButton>
            <GhostButton onClick={handleClose}>I'll do it later</GhostButton>
          </div>
        </>
      )}

      {step === 'paired' && buddy && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Your buddy
          </h2>
          <Card className="mt-2 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                  {buddy.name}
                </div>
                <div className="text-sm text-muted">
                  {buddy.workoutsThisWeek}/{buddy.weekTarget} this week · {buddy.streak} week streak
                </div>
              </div>
              <div className="text-right text-sm text-muted">
                You
                <br />
                <span className="font-semibold text-ink">
                  {myWeekCount}/{profile.target}
                </span>
              </div>
            </div>
          </Card>
          <div className="mt-4 grid gap-3">
            <GhostButton onClick={() => setStep('unpair-confirm')}>Unpair</GhostButton>
          </div>
        </>
      )}

      {step === 'unpair-confirm' && buddy && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
            Unpair from {buddy.name}?
          </h2>
          <p className="mb-4 text-sm text-warn">
            Nothing else is shared after this — on either side. You can pair with someone new any time.
          </p>
          <div className="grid gap-3">
            <button
              type="button"
              className="min-h-[52px] w-full rounded-2xl bg-warn font-display text-xl font-bold text-chalk transition-transform active:scale-[0.98]"
              onClick={unpair}
            >
              Unpair
            </button>
            <GhostButton onClick={() => setStep('paired')}>Keep buddy</GhostButton>
          </div>
        </>
      )}
    </Sheet>
  )
}
