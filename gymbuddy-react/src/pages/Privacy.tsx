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
          GymBuddy is built to work without an account. Everything below only applies if you choose to fill in the optional
          "save my progress" card after your first workout — the app works fully without it.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          What we collect
        </h2>
        <p>If you fill in the optional card, we store: your first name, your age (if you choose to give it), and one contact detail — either a phone number or an email address, whichever you pick.</p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          Why
        </h2>
        <p>Only to save your progress across devices in the future and to send a reminder on your gym days, if we build that. Nothing here is used for anything else, and it's never required — the app's core loop (plan, swap, log) works fully without it.</p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          Where it lives
        </h2>
        <p>
          Right now, on your device only — in your browser's local storage, alongside your workout history. There is no
          backend or server this data is sent to in the current build.
        </p>

        <h2 className="mb-2 mt-8 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          How to have it deleted
        </h2>
        <p>
          Open Settings in the app and tap "Delete my details" — this clears it from your device immediately. If you've
          contacted us some other way and want anything else deleted, email us at{' '}
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
