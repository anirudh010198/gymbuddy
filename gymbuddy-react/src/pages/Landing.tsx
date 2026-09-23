import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'
import PlateLogo from '../site/components/PlateLogo'
import SwapDemo from '../site/components/SwapDemo'
import { research } from '../site/lib/research'
import { EXERCISES } from '../engine/exercises'
import { GOALS } from '../engine/goals'
import { GROUP_LABEL } from '../engine/templates'
import type { Group } from '../engine/types'

// Once the team drops a real gym photo at public/images/hero.jpg, set this to
// '/images/hero.jpg' — the heavy dark overlay switches on automatically and
// the neon-streak/plate-motif fallback below disappears. Left blank rather
// than pointed at a file that doesn't exist yet, which would just show a
// broken image.
const HERO_IMAGE_URL = ''

const HEADLINE_LINES = ['Walk in.', 'Know exactly', 'what to do.']

// The core 24-exercise library (FEATURES.md Feature 1) — excludes the 7
// ported bodyweight fallbacks, which only ever surface as swaps for
// visitors with no equipment, not as part of the headline "what you get".
const CORE_EXERCISES = EXERCISES.filter((e) => e.equip !== 'bodyweight')
const GROUPS: Group[] = ['legs', 'push', 'pull']

const HOW_IT_WORKS = [
  { n: 1, title: 'Pick a goal', body: 'Lose fat, build muscle, or get generally fit — plus the equipment your gym actually has.' },
  { n: 2, title: 'Do 3 exercises', body: 'One legs, one push, one pull. About 25 minutes, no guessing what comes next.' },
  { n: 3, title: 'Machine busy? Swap', body: "Tell us why and we'll pick a replacement that works the same muscles." },
  { n: 4, title: 'Streak grows weekly', body: 'Hit your weekly target and watch the streak build — a rest day never breaks it.' },
]

function InsightCard({ title, evidence, implication }: { title: string; evidence: string; implication: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-5">
      <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
        {title}
      </div>
      <p className="mt-2 text-sm text-muted">{evidence}</p>
      <p className="mt-2 text-sm">{implication}</p>
    </div>
  )
}

export default function Landing() {
  const reduce = useReducedMotion()

  const interviewCount = research.interviews.length
  const funnel = research.funnel

  return (
    <div className="bg-bg text-ink">
      <SiteHeader />
      <main>
      {/* HERO — full-bleed cinematic dark, red neon accent */}
      <section className="relative overflow-hidden bg-rubber text-chalk">
        {HERO_IMAGE_URL ? (
          <>
            <img
              src={HERO_IMAGE_URL}
              alt="A gym floor with racked dumbbells and machines — the kind of equipment GymBuddy helps beginners recognise."
              width={1600}
              height={900}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Heavy overlay so the headline stays crisp over a busy photo. */}
            <div className="absolute inset-0 bg-rubber/80" aria-hidden="true" />
          </>
        ) : (
          <>
            {/* Ceiling-neon fallback: a bright red streak along the top edge
                with a soft glow falling down the frame, plus the low-opacity
                plate motif already used elsewhere in the hero. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--red) 20%, var(--red) 80%, transparent)' }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60 blur-3xl"
              style={{ background: 'linear-gradient(180deg, var(--red-glow), transparent)' }}
            />
            <PlateLogo size={440} className="pointer-events-none absolute -right-28 -top-28 text-plate/10" />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:py-20">
          <div
            className="font-display font-extrabold uppercase tracking-wide text-plate"
            style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)', textShadow: '0 0 18px var(--red-glow), 0 0 36px var(--red-glow)' }}
          >
            GymBuddy
          </div>
          <h1
            className="mt-2 font-display font-extrabold uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4.2rem)' }}
          >
            {HEADLINE_LINES.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : i * 0.1, ease: 'easeOut' }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <p className="mt-5 max-w-[440px] text-lg text-ash">3 exercises a day. A backup ready when your machine is taken.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/app" className="rounded-2xl bg-plate px-6 py-3.5 font-display text-lg font-bold text-plate-ink shadow-neon">
              Start today's workout
            </Link>
            <a href="#how-it-works" className="rounded-2xl border-2 border-steel px-6 py-3.5 font-display text-lg font-bold text-chalk">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
          What's inside
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Three goals to choose from, and the {CORE_EXERCISES.length}-exercise library GymBuddy picks and swaps from — see it
          all before you open the app.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(Object.entries(GOALS) as [string, (typeof GOALS)[keyof typeof GOALS]][]).map(([k, g]) => (
            <div key={k} className="rounded-card border border-line bg-card p-4">
              <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                {g.label}
              </div>
              <div className="text-sm text-muted">{g.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted">{GROUP_LABEL[group]}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {CORE_EXERCISES.filter((e) => e.group === group).map((e) => (
                  <span key={e.id} className="rounded-full bg-soft px-3 py-1 text-sm">
                    {e.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Link to="/exercises" className="mt-6 inline-block font-semibold underline decoration-line underline-offset-2">
          See the full exercise library →
        </Link>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
          "I walk in and don't know where to start."
        </h2>
        {research.insights.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {research.insights.map((ins, i) => (
              <InsightCard key={i} title={ins.title} evidence={ins.evidence} implication={ins.implication} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-line bg-card p-6 text-muted">
            Research in progress — insights will appear here once the team logs interviews through the research console.
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-card py-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            How it works
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n}>
                <div className="font-display font-extrabold text-plate" style={{ fontSize: '2.4rem' }}>
                  {s.n}
                </div>
                <div className="mt-1 font-display font-bold" style={{ fontSize: '1.2rem' }}>
                  {s.title}
                </div>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SWAP DEMO */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
              The Swap, explained
            </h2>
            <p className="mt-3 max-w-md text-muted">
              Leg Press is taken. Tap Swap, tell us why, and watch it become a real replacement — instantly, no internet
              needed. Try it:
            </p>
          </div>
          <SwapDemo />
        </div>
      </section>

      {/* BUILT WITH USERS */}
      <section className="bg-card py-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            Built with users
          </h2>
          {funnel.approached != null ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-card border border-line bg-bg p-5 text-center">
                <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
                  {funnel.approached}
                </div>
                <div className="text-sm text-muted">people approached</div>
              </div>
              <div className="rounded-card border border-line bg-bg p-5 text-center">
                <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
                  {funnel.completed ?? '–'}
                </div>
                <div className="text-sm text-muted">completed a workout</div>
              </div>
              <div className="rounded-card border border-line bg-bg p-5 text-center">
                <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
                  {funnel.returned ?? '–'}
                </div>
                <div className="text-sm text-muted">came back next day</div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-muted">User testing in progress — {interviewCount} interview{interviewCount === 1 ? '' : 's'} logged so far.</p>
          )}
          <Link to="/case-study" className="mt-5 inline-block font-semibold underline decoration-line underline-offset-2">
            Read the full case study →
          </Link>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 text-center sm:px-6">
        <h2 className="font-display font-extrabold" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Try today's workout.
        </h2>
        <p className="mt-2 text-muted">No sign-up. 30 seconds.</p>
        <Link to="/app" className="mt-6 inline-block rounded-2xl bg-plate px-8 py-4 font-display text-xl font-bold text-plate-ink">
          Start today's workout
        </Link>
      </section>
      </main>

      <SiteFooter />
    </div>
  )
}
