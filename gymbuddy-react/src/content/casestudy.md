# GymBuddy — build notes

This file is the source the case-study page's Decisions/Build/Roadmap sections
are written from. Research-derived sections (problem, persona, insights,
funnel, metrics) live in `research.json` instead, and stay empty until the
team logs real interviews and tests through `/team`.

## V1 / V2 / Cut

**V1 (shipped this build):** onboarding (goal, equipment, weekly target); a
daily 3-exercise workout (Legs/Push/Pull, A/B rotation) from a 24-exercise
library plus 7 bodyweight fallbacks for no-equipment gyms; reason-aware Swap
(busy / unsure / hurts) that always shows the pain-vs-soreness safety note;
per-set reps + weight logging pre-filled from last time; a workout breakdown
with vs-last-time comparisons and personal-best detection; bonus-tip unlocks
in Build-muscle mode; weekly streak and 14-day calendar; a muscle map, PB
pulse, next-workout teaser and share card; History and Settings; a hidden
research console at `/team`; installable offline PWA.

**V2 (deferred, not built this pass):** a persistent rest countdown bar under
each exercise card (we shipped a rest-reminder toast instead, to keep the
workout screen calmer — this is the one item worth revisiting if user tests
ask for it); inline SVG movement diagrams per exercise and equipment-type
line illustrations in onboarding; collapsing the How/Avoid/Start section
after a user has done an exercise twice; the plate-stacking celebration
animation on the summary screen.

**Cut (deliberately out of scope):** diet/calorie tracking, social feed,
leaderboards, custom routine builder, login/accounts, payments, wearables,
badges/XP. V1 stays a floor companion, not a fitness platform.

## 3 key decisions

1. **Ported the vanilla exercise/swap/streak logic instead of redesigning
   it.** Trade-off: some resulting code (the tier-based swap fallback) reads
   less like an idiomatic React state machine than a rewrite would, but it
   meant zero behavioral drift from logic that had already been reasoned
   through, and it's covered by unit tests written before any UI existed.

2. **Reps/weight logging pre-fills from history instead of starting
   blank.** Trade-off: this scans history for the exercise's last log on
   every workout-screen render — fine at hundreds of logged workouts, but it
   would need memoizing or indexing if History ever grew into the thousands.

3. **The share-card image is drawn with the native Canvas API, not a
   screenshot library.** Trade-off: more code than "screenshot this div",
   but it keeps the dependency list at exactly what the tech stack specifies
   and guarantees the shared image only ever contains the numbers we choose
   to draw — never a stray bit of UI chrome.

## Build

**Stack:** Vite + React 18 + TypeScript, Tailwind CSS v3 with CSS-variable
design tokens for light/dark, React Router, Zustand + persist, Framer
Motion, vite-plugin-pwa, self-hosted Barlow / Barlow Condensed via
@fontsource, Vitest for the engine. No backend, no database.

**What broke → how we fixed it:**

| Broke | Fixed by |
|---|---|
| PostCSS rejected `@import` placed after `@tailwind` | Moved the @fontsource imports above the @tailwind directives |
| Zustand persist's envelope check skipped the migration step once the store had saved once, so an older data shape would be read back unsanitized | Migration now always unwraps to the inner state and re-sanitizes it, wrapped or not |
| A shared `Card` component's own border class out-ranked a conditionally-added warning border at equal CSS specificity | Rebuilt that one warning box without the shared wrapper instead of fighting class-order |
| `className` passed into the team console's shared text-input components was silently dropped | Merged the incoming className instead of overwriting it |

## What's next (3-month roadmap)

1. **AI coach ("Ask GymBuddy") for form/weight questions** — gated behind an
   environment variable and a daily per-user question cap, because the core
   loop must keep working offline and without AI even after this ships.
2. **Movement diagrams and equipment line illustrations** — probably the
   highest-leverage thing left for beginners who don't know equipment by
   name; deferred only because it needs one consistent illustration pass
   rather than one-off SVGs.
3. **Real interview and test data** — the point of the research console.
   Nothing in this page's Research or Metrics sections is honest until the
   team runs interviews and test sessions through `/team` and exports
   `research.json`.
