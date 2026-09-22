/** Structured version of casestudy.md, rendered directly by the case-study page
 *  (no markdown-table parser in the stack). Keep this in sync with the prose
 *  in casestudy.md when either changes. */

export const V1_SCOPE = [
  'Onboarding: goal, equipment, weekly target',
  'Daily 3-exercise workout (Legs/Push/Pull, A/B rotation), 24-exercise library + 7 bodyweight fallbacks',
  'Reason-aware Swap (busy / unsure / hurts), always shows the pain-vs-soreness safety note',
  'Per-set reps + weight logging, pre-filled from last time',
  'Workout breakdown: vs-last-time comparisons, personal-best detection',
  'Bonus-tip unlocks in Build-muscle mode',
  'Weekly streak + 14-day calendar',
  'Muscle map, PB pulse, next-workout teaser, share card',
  'History (read-only) and Settings (goal/equipment/target, export, reset)',
  'Hidden research console (/team): interviews, test funnel, manual + AI-assisted synthesis, research.json export',
  'Installable, offline-first PWA',
  'Optional "Ask GymBuddy" coach per exercise (Gemini via a Vercel serverless function) — hidden when offline or unconfigured, capped at 10 questions/user/day, never diagnoses injuries',
]

export const V2_SCOPE = [
  'Persistent rest countdown bar under each card (shipped a rest-reminder toast instead — the one item worth revisiting if user tests ask for it)',
  'Inline SVG movement diagrams per exercise, equipment line illustrations in onboarding',
  'Collapsing How/Avoid/Start after a user has done an exercise twice',
  'Plate-stacking celebration animation on the summary screen',
]

export const CUT_SCOPE = [
  'Diet/calorie tracking',
  'Social feed, leaderboards',
  'Custom routine builder',
  'Login / accounts, payments',
  'Wearables, badges/XP',
]

export interface Decision {
  title: string
  tradeoff: string
}

export const DECISIONS: Decision[] = [
  {
    title: 'Ported the vanilla exercise/swap/streak logic instead of redesigning it',
    tradeoff:
      "Some resulting code (the tier-based swap fallback) reads less like an idiomatic React state machine than a rewrite would, but it meant zero behavioral drift from logic that had already been reasoned through, and it's covered by unit tests written before any UI existed.",
  },
  {
    title: 'Reps/weight logging pre-fills from history instead of starting blank',
    tradeoff:
      "Scans history for the exercise's last log on every workout-screen render — fine at hundreds of logged workouts, but would need memoizing or indexing if History ever grew into the thousands.",
  },
  {
    title: 'The share-card image is drawn with the native Canvas API, not a screenshot library',
    tradeoff:
      'More code than "screenshot this div", but keeps the dependency list at exactly what the tech stack specifies and guarantees the shared image only ever contains the numbers chosen to draw — never stray UI chrome.',
  },
  {
    title: 'The AI coach looks up exercise cues server-side instead of trusting the client-sent copy',
    tradeoff:
      "The serverless function re-imports the exercise library and rebuilds the system prompt from the exercise id alone, ignoring any cue text the client could send. A little more coupling between api/ and src/engine/, but it means the coaching prompt can't be tampered with by editing request payloads.",
  },
]

export const STACK = [
  'Vite + React 18 + TypeScript',
  'Tailwind CSS v3, CSS-variable design tokens for light/dark',
  'React Router',
  'Zustand + persist',
  'Framer Motion',
  'vite-plugin-pwa',
  'Self-hosted Barlow / Barlow Condensed via @fontsource',
  'Vitest for the engine, Playwright for e2e',
  'No database. Two Vercel serverless functions (api/ask.ts, api/synthesize.ts) call the Gemini API for the optional AI features — the core workout loop has no backend dependency at all and works fully offline',
]

export interface BrokeFixedRow {
  broke: string
  fixed: string
}

export const BROKE_FIXED: BrokeFixedRow[] = [
  { broke: 'PostCSS rejected @import placed after @tailwind', fixed: 'Moved the @fontsource imports above the @tailwind directives' },
  {
    broke: "Zustand persist's envelope check skipped the migration step once the store had saved once, so an older data shape would be read back unsanitized",
    fixed: 'Migration now always unwraps to the inner state and re-sanitizes it, wrapped or not',
  },
  {
    broke: "A shared Card component's own border class out-ranked a conditionally-added warning border at equal CSS specificity",
    fixed: 'Rebuilt that one warning box without the shared wrapper instead of fighting class order',
  },
  { broke: 'className passed into the team console\'s shared text-input components was silently dropped', fixed: 'Merged the incoming className instead of overwriting it' },
]

export interface RoadmapItem {
  title: string
  reason: string
}

export const ROADMAP: RoadmapItem[] = [
  {
    title: 'Movement diagrams and equipment line illustrations',
    reason: "Probably the highest-leverage thing left for beginners who don't know equipment by name; deferred only because it needs one consistent illustration pass rather than one-off SVGs.",
  },
  {
    title: 'Real interview and test data',
    reason: "The point of the research console. Nothing in this page's Research or Metrics sections is honest until the team runs interviews and test sessions through /team and exports research.json.",
  },
]
