import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'

const CONTACT_EMAIL = 'anirudhdwivedi01@gmail.com'

export default function Privacy() {
  return (
    <div className="bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-4 pb-16 pt-8 sm:px-6">
        <h1 className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}>
          Privacy
        </h1>
        <p className="mt-3 text-muted">
          GymBuddy is built to work without an account. Signing in is entirely optional and only adds one thing: your workout
          history syncing across your devices. Everything below explains the two separate, optional ways GymBuddy can store a
          little more about you — you can use neither, either, or both.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          If you sign in (Google or email link)
        </h2>
        <p>
          <b>What we collect:</b> your email address (from Google, or the one you type in for an email link — never a
          password, we don't have one), plus what's already in your local plan (age, goal, equipment, weekly target,
          effort-label style) and your workout history (dates, exercises, sets, reps, weight, and effort ratings — not swap
          history or bonus-tip unlocks, those stay local only).
        </p>
        <p className="mt-2">
          <b>Why:</b> only to restore your plan and progress if you open GymBuddy on another device, or after clearing this
          one. Nothing here is used for anything else, and the app's core loop (plan, swap, log) works exactly the same
          whether you sign in or not.
        </p>
        <p className="mt-2">
          <b>Where it lives:</b> a Supabase-hosted database, access-restricted at the database level so only your own
          signed-in account can ever read or write your own rows — not other users, and not us browsing a shared table.
        </p>
        <p className="mt-2">
          <b>How to have it deleted:</b> open Settings → Account → "Delete my account and data". This permanently deletes
          your account and every synced workout — it can't be undone, and there's no recovery period.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          If you fill in the "save my progress" card
        </h2>
        <p>
          <b>What we collect:</b> your first name, your age (if you choose to give it), and one contact detail — either a
          phone number or an email address, whichever you pick. This is separate from signing in above; it's the small
          skippable card shown after your first workout.
        </p>
        <p className="mt-2">
          <b>Why:</b> only to save your progress across devices in the future and to send a reminder on your gym days, if we
          build that. Never required — the app's core loop works fully without it.
        </p>
        <p className="mt-2">
          <b>Where it lives:</b> on your device only, in your browser's local storage. It is never sent to Supabase or
          anywhere else, even if you're signed in.
        </p>
        <p className="mt-2">
          <b>How to have it deleted:</b> open Settings and tap "Delete my details" — this clears it from your device
          immediately.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          If you use Rush Radar
        </h2>
        <p>
          <b>What we collect:</b> if you tap "Use my location", your device's GPS coordinates are sent once, directly to
          OpenStreetMap's free Overpass API, only to list gyms near you — never to us, and never stored anywhere, on your
          device or off it. If you tap "None of these" or skip location entirely, you can type your gym's name instead.
        </p>
        <p className="mt-2">
          <b>What we save:</b> only your gym's name and a short code derived from it, so busy-machine reports from other
          GymBuddy users at the same gym can be shown to you (and yours to them) — never your coordinates, never which gym
          you're at right now, just the name you picked.
        </p>
        <p className="mt-2">
          <b>Why:</b> to show "usually busy"/"usually free" hints for equipment at your gym, built from everyone's "it's busy"
          swaps. Entirely optional — the app works exactly the same without it.
        </p>
        <p className="mt-2">
          <b>How to have it deleted:</b> open the Rush Radar tab → "Clear", or use "Reset all data" in Settings to remove
          everything at once.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          If you use "Train with a buddy"
        </h2>
        <p>
          <b>What we collect:</b> the name you type in, plus your weekly workout count, weekly target, streak, and the date
          of your last workout — never anything about a specific exercise, set, rep, or weight.
        </p>
        <p className="mt-2">
          <b>What we save:</b> your paired buddy's name and that same snapshot of their progress, exactly what they chose to
          share when they invited or replied to you.
        </p>
        <p className="mt-2">
          <b>Where it goes:</b> there's no server for this yet, so that snapshot travels inside the invite link itself (via
          whatever app you share it through — WhatsApp, Messages, etc.) — never sent to us. Because of that, your buddy's
          progress on your screen is a snapshot from whenever you last paired or replied, not a live feed.
        </p>
        <p className="mt-2">
          <b>How to have it deleted:</b> open Settings → Buddy → "Manage buddy" → "Unpair", any time, from either side —
          nothing else is shared afterward. "Reset all data" removes it too.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          Either way
        </h2>
        <p>
          If you've contacted us some other way and want anything else deleted, email{' '}
          <a className="underline decoration-line underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          and we'll action it.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          Questions
        </h2>
        <p>
          Reach us at{' '}
          <a className="underline decoration-line underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
