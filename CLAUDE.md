# CLAUDE.md — GymBuddy V1 website

> Put this file in the root of your project folder (next to the existing `gymbuddy/` code), then open Claude Code there. Claude Code reads `CLAUDE.md` automatically. Run the build prompts at the bottom **one at a time**, checking the result in the browser after each.

---

## 1. What we're building

GymBuddy helps **beginner gym-goers in their first 90 days** know exactly what to do on the gym floor. Research showed beginners quit because every session starts with not knowing what to do, and ends early when a planned machine is busy.

The website has three parts:

1. **Landing page (`/`)** — explains the problem and the product in 10 seconds, with a live demo embedded. This is what judges and new users see first.
2. **The app (`/app`)** — the working product: onboarding, today's workout, Swap, set logging, weekly streak. Installable on a phone (PWA) and works offline.
3. **Case study (`/case-study`)** — how we built it: research → decisions → build → testing → metrics. This page is for the PML judges and is the most important page for winning.

Plus a hidden **research console (`/team`)** for logging interviews and the test funnel.

### Non-negotiable product rules

- The existing logic in `gymbuddy/js/app.js` is the source of truth: the exercise library (`LIB`), A/B templates, goals, the reason-aware swap engine (`swapCandidate`), and the weekly streak (`streakWeeks`). **Port it, don't redesign it.**
- V1 scope only. Do **not** add: diet/calorie tracking, social feed, leaderboards, custom routine builder, login/accounts, payments, wearables, badges/XP. These were deliberately cut.
- **Never invent data.** No fake testimonials, user counts, star ratings, "10,000 users", or made-up quotes. Research numbers and quotes are loaded from `src/content/research.json`, which the team fills in. If a field is empty, the section shows a tasteful "Research in progress" state, not filler.
- The core loop (plan, swap, log) must work **offline and without AI**. Gym Wi-Fi is bad.
- Safety: every exercise shows an "avoid" cue and a conservative starting weight. The "It hurts" swap always shows the pain-vs-soreness safety note.

---

## 2. Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v3** with the design tokens below as theme extensions
- **React Router** for `/`, `/app`, `/case-study`, `/team`
- **Framer Motion** for the few deliberate animations (see Motion)
- **vite-plugin-pwa** — installable, offline-first, app icon, splash colour
- **Zustand** (with `persist` middleware → localStorage) for app state
- **Playwright** for end-to-end tests
- Deploy target: **Vercel** (static build)

No backend. No database. No external API calls on the critical path.

---

## 3. Design system (keep this identity — it's already ours)

The look is **gym-floor signage**: big condensed type, rubber-floor dark, chalk-white, and bumper-plate yellow. Confident and legible at arm's length, one-thumb usable, never "fitness influencer" glossy.

| Token | Hex | Use |
|---|---|---|
| `rubber` | `#1E2B30` | Dark surfaces, text on light |
| `chalk` | `#EEF1EC` | Page background (light) |
| `plate` | `#F2C230` | Primary action, progress, logged sets |
| `plate-ink` | `#3A2E00` | Text on yellow |
| `iron` | `#5B6B70` | Secondary text |
| `go` | `#2F8F5B` | Success, swapped-in confirmation |
| `warn` | `#C2412D` | Safety notes only |
| `line` | `#D5DBD6` | Borders |

Dark mode: background `#152024`, cards `#1E2B30`, text `#EEF1EC`, muted `#9FB0B4`, borders `#2E3E44`. Follow system preference.

**Type:** `Barlow Condensed` (600–800) for headings, numbers and buttons; `Barlow` (400–700) for body. Self-host both via `@fontsource` so they work offline.

**Signature element:** set-logging buttons are **weight plates** (circles with a centre hole) that fill yellow when tapped. Reuse the plate motif sparingly elsewhere: the logo mark, the landing hero, loading states. Nowhere else should get decoration.

**Avoid:** gradients, glassmorphism, stock photos of models, emoji icons, generic SaaS card grids with identical shadows, ALL-CAPS eyebrow labels, "→" on every button.

**Accessibility:** 44px minimum touch targets (plates are 58px), visible focus rings, `prefers-reduced-motion` respected, WCAG AA contrast, every icon button labelled.

---

## 4. Page specs

### 4.1 Landing page `/`

```
┌───────────────────────────────────────────────────────┐
│ [plate logo] GymBuddy            Case study  [Open app]│
├───────────────────────────────────────────────────────┤
│ Walk in.                          ┌──────────────┐     │
│ Know exactly                      │  LIVE PHONE  │     │
│ what to do.                       │  DEMO (the   │     │
│                                   │  real /app   │     │
│ 3 exercises a day. A backup       │  in a phone  │     │
│ when your machine is taken.       │  frame)      │     │
│ [Start today's workout] [How]     └──────────────┘     │
├───────────────────────────────────────────────────────┤
│ The problem: "I walk in and don't know where to start."│
│ 3 insight cards (from research.json)                   │
├───────────────────────────────────────────────────────┤
│ How it works: 1 Pick goal → 2 Do 3 exercises →         │
│ 3 Machine busy? Swap → 4 Streak grows weekly           │
├───────────────────────────────────────────────────────┤
│ The Swap, explained: interactive mini demo — tap a     │
│ busy Leg Press, choose a reason, watch it become       │
│ Goblet Squat with the reason shown                     │
├───────────────────────────────────────────────────────┤
│ Built with users: funnel numbers from research.json    │
│ + link to case study                                   │
├───────────────────────────────────────────────────────┤
│ Big CTA: Try today's workout. No sign-up. 30 seconds.  │
│ Footer: PML Product Challenge · safety disclaimer      │
└───────────────────────────────────────────────────────┘
```

- **Hero:** left-aligned headline in Barlow Condensed 800, very large. Right side: the real app running inside a CSS phone frame (render the `/app` component tree in a sandboxed container with its own separate state key `gymbuddy.demo`, so the demo never touches the visitor's real progress). On mobile, the phone frame is replaced by the primary CTA.
- **How it works:** a true 4-step sequence, so numbered markers are appropriate here.
- **Swap demo:** the single memorable interactive moment on the page. Keep it small and self-contained.
- **Built with users:** reads `research.json`. Empty → show "User testing in progress" with the number of interviews logged so far (can be 0). Never placeholder numbers.
- **Footer disclaimer:** "GymBuddy gives general guidance for healthy adults. Stop if you feel sharp or joint pain, and ask a qualified trainer or doctor."

### 4.2 The app `/app`

Port every current screen and behaviour, then add these upgrades (all within V1 scope):

1. **Onboarding (2 steps)** — goal, then equipment + days/week. Add a small line illustration (inline SVG, plate-yellow on rubber) for each equipment type so beginners who don't know machine names can recognise them.
2. **Today's workout**
   - Each exercise card gets a simple **inline SVG movement diagram** (stick-figure start and end position, two frames) for the 12 most-used exercises. Plain, consistent line style. No external images.
   - A **muscle tag** chip and a collapsible "How / Avoid / Start weight" section: expanded by default on the first workout, collapsed after the user has done that exercise twice.
   - Plate buttons animate on tap (fill + slight scale) and trigger `navigator.vibrate(15)` where supported.
   - After logging a set, show an unobtrusive **rest countdown bar** under the card using the goal's rest time. Tapping it dismisses it. (This is the one promoted V2 item; it came up as the top "what's next" need. Remove it if your user tests don't support it.)
3. **Swap sheet** — same 3 reasons. After swapping, the card briefly shows "Swapped in for X (reason)" in `go` green. "It hurts" always shows the safety sheet first.
4. **Finish + summary** — sets, x/target this week, week streak, 14-day calendar, "How did today feel?". One orchestrated celebration animation on the summary (plates stacking onto a bar), respecting reduced motion.
5. **History** (new tab in the app's bottom nav): list of past workouts with date, sets, swaps. Read-only. This makes progress visible, which is part of the core problem.
6. **Bottom nav:** Today · History · Settings (change goal/equipment/target, reset data, export data as JSON).
7. **PWA:** installable, offline, app icon is the plate logo, theme colour `#1E2B30`. Show a one-time "Add to home screen" hint after the first completed workout, not before.

Event log (keep the existing `track()` events: `onboard_done`, `workout_generated`, `swap_opened`, `swap_done` with reason, `set_logged`, `workout_done`, `feel`). These power the metrics.

### 4.3 Case study `/case-study`

A long-form, beautifully typeset page — the judges' page. Sections in this order, each fed from `src/content/research.json` or `src/content/casestudy.md`:

1. **The problem** — persona card + problem statement
2. **Research** — interview matrix table (who, venue, routine, observation, frustration), 3 insights with evidence, quotes (only consented ones), and **one hypothesis the research killed**
3. **Decisions** — V1 / V2 / Cut table and the 3 key decisions with trade-offs
4. **Build** — stack, and the "what broke → how we fixed it" table
5. **Testing** — funnel as a horizontal bar chart (SVG, no chart library), learnings, and a before/after of the one iteration
6. **Metrics** — primary metric (≥2 workouts in week 1) big, supporting metrics small, with sample size shown honestly
7. **What's next** — 3-month roadmap with the reason for each item

Include a sticky left-hand table of contents on desktop, and a "Download as PDF" link that triggers `window.print()` with a print stylesheet.

### 4.4 Research console `/team`

Port the existing Interviews and Test funnel tabs. Not linked anywhere on the site. Data in localStorage under `gymbuddy.team`. Add:
- **Export to `research.json`** button that writes the exact shape the landing and case study pages read, so publishing research is: export → drop file into `src/content/` → redeploy.
- Import JSON (to merge data collected on two devices).

---

## 5. Motion

Only three animated moments. Nothing else moves on its own.
1. Landing hero: headline lines reveal once on load.
2. Plate tap: fill + 1.05 scale, 120 ms.
3. Workout summary: plates stack onto a bar, once.

---

## 6. Quality bar (acceptance criteria)

- Lighthouse on `/app` (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, PWA installable.
- `/app` works fully in airplane mode after first load.
- Playwright tests cover: onboarding → workout → busy swap → pain swap (safety sheet shown) → log all sets → finish → summary shows 1/target; resume after navigating away; streak doesn't break on a rest day (mock dates); team export produces valid `research.json`.
- No console errors. No layout shift on load. Works at 360px width.
- Zero hard-coded research numbers or quotes anywhere in components.

---

## 7. Build prompts for Claude Code (run one at a time)

**Prompt 1 — Scaffold**
> Read CLAUDE.md and the existing code in `gymbuddy/`. Scaffold a Vite + React + TypeScript project with Tailwind, React Router, Zustand, Framer Motion, vite-plugin-pwa and self-hosted Barlow fonts. Set up the design tokens from section 3 as Tailwind theme colours and CSS variables with dark mode. Create empty routes for `/`, `/app`, `/case-study`, `/team`. Don't build any pages yet. Show me the folder structure when done.

**Prompt 2 — Port the engine**
> Port the exercise library, templates, goals, `swapCandidate`, `streakWeeks`, date helpers and `track()` from `gymbuddy/js/app.js` into typed modules under `src/engine/`. Keep behaviour identical. Write unit tests (Vitest) for: swap never repeats a tried exercise, busy prefers different equipment, pain prefers lowest level, streak ignores an unfinished current week.

**Prompt 3 — The app**
> Build `/app` per section 4.2 using the engine: onboarding, today's workout with plate buttons, swap sheet with the safety note, finish, summary, history, settings, bottom nav. Persist with Zustand under `gymbuddy.v1` (compatible with the old data shape). Skip the SVG diagrams and rest timer for now.

**Prompt 4 — Movement diagrams + rest bar**
> Add consistent two-frame inline SVG movement diagrams for the 12 most-used exercises, and the rest countdown bar from 4.2. Match the design system; no external images.

**Prompt 5 — PWA + offline**
> Configure the PWA: manifest, plate-logo icons (generate as SVG → PNG sizes), offline caching of all assets and fonts, and the post-first-workout install hint. Verify the app works in airplane mode.

**Prompt 6 — Team console**
> Build `/team` per 4.4, porting the Interviews and Test funnel UIs, with export to `src/content/research.json` shape and import/merge.

**Prompt 7 — Landing page**
> Build `/` per 4.1. The hero phone frame runs the real app with a separate `gymbuddy.demo` storage key. Research sections read `research.json` and show honest empty states. Add the interactive Swap demo.

**Prompt 8 — Case study**
> Build `/case-study` per 4.3 with sticky TOC, SVG funnel chart, and print stylesheet. All content from `research.json` and `casestudy.md`.

**Prompt 9 — Tests, polish, deploy**
> Write the Playwright tests in section 6, run Lighthouse, fix everything below the quality bar, then prepare for Vercel deployment and tell me the exact deploy commands.

---

## 8. Content files the team fills in

`src/content/research.json`
```json
{
  "interviews": [
    { "name": "", "age": "", "venue": "", "routine": "", "observation": "", "frustration": "", "quote": "", "consent": false }
  ],
  "insights": [ { "title": "", "evidence": "", "implication": "" } ],
  "killedHypothesis": "",
  "funnel": { "approached": null, "tried": null, "completed": null, "wouldReuse": null, "returned": null },
  "metrics": { "week1Repeat": null, "swapConversion": null, "setCompletion": null, "sampleSize": null },
  "iteration": { "saw": "", "assumed": "", "changed": "", "result": "" }
}
```

`null` or empty means "not collected yet" and every page must handle it gracefully.
