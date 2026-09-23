import type { Page } from '@playwright/test'

/** Freezes only `Date`/`Date.now()` to a fixed instant, via an init script that
 *  re-runs on every navigation/reload. Deliberately not Playwright's built-in
 *  `page.clock` — that also pauses setTimeout/requestAnimationFrame, which got
 *  Framer Motion's layout animations stuck and made every click a no-op. */
export async function mockDate(page: Page, iso: string) {
  await page.addInitScript((isoStr) => {
    const fixedTime = new Date(isoStr).getTime()
    const RealDate = Date
    class FakeDate extends RealDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) super(fixedTime)
        // @ts-expect-error forwarding whichever Date constructor overload was called
        else super(...args)
      }
      static now() {
        return fixedTime
      }
    }
    // @ts-expect-error overriding the global Date with our fixed-time version
    window.Date = FakeDate
  }, iso)
}

/** Walks through onboarding (welcome -> age -> goal -> equipment/days, age
 *  required) with the first goal option and default equipment/target, then
 *  skips the post-onboarding sign-in screen ("Continue without an account"
 *  — see app/screens/AuthStep.tsx), landing on Home with the day-select
 *  sheet auto-open. Doesn't pick a day — use `completeOnboarding` for that,
 *  or call `startWorkout`/`getByRole('button', {name: /^Build my own/})`
 *  etc. directly from here for a test that needs a different first action. */
export async function onboardOnly(page: Page, age = '28') {
  await page.goto('/app')
  // A brand-new device sees the one-time 3-card intro before onboarding —
  // skip it so every other helper/test can assume onboarding is first.
  await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel('Your age').fill(age)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('button[aria-pressed]').first().click() // first goal chip
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click()
  await page.getByRole('button', { name: 'Continue without an account' }).click()
}

/** `onboardOnly` and then starts a workout. */
export async function completeOnboarding(page: Page) {
  await onboardOnly(page)
  await startWorkout(page)
}

/** Picks a day and starts a workout. The day-select sheet auto-opens as the
 *  first thing on every fresh Home mount where there's a genuine choice to
 *  make (not mid-workout, not already done for today) — including right
 *  after onboarding and after a reload on a new day — so this assumes it's
 *  already open rather than tapping "Start today's workout" first: that Dock
 *  button sits BEHIND the sheet's full-screen backdrop once it's open, so
 *  clicking it would actually hit the backdrop and close the sheet instead.
 *  Regex name match: the day buttons also contain a muscle sub-label and,
 *  for the suggested day, a "Suggested" badge — so an exact match would fail. */
export async function startWorkout(page: Page, day: 'Legs' | 'Push' | 'Pull' = 'Legs') {
  await page.getByRole('button', { name: new RegExp(`^${day}`) }).click()
  // Every fresh session opens on the one-time warm-up screen (see
  // app/screens/Warmup.tsx) before the exercise cards — skip it so callers
  // land straight on the workout, same as before it existed.
  await page.getByRole('button', { name: 'Skip warm-up' }).click()
}

/** Logs every set on every exercise card of the active workout. A small pause
 *  after each click gives React/Framer Motion's layout animation a moment to
 *  settle before the next actionability check — back-to-back clicks with zero
 *  delay were leaving the Finish button mid-transition and "not stable". */
export async function logAllSets(page: Page) {
  const cards = page.locator('section[aria-label]')
  // locator.count() is an instant snapshot, not an auto-waiting query — without
  // this, a page still mid-navigation to the Workout screen reads back 0 cards
  // and the loop below silently does nothing.
  await cards.first().waitFor({ state: 'visible' })
  const count = await cards.count()
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i)
    while ((await card.getByRole('button', { name: /not done/ }).count()) > 0) {
      await card.getByRole('button', { name: /not done/ }).first().click()
      await page.waitForTimeout(80)
    }
  }
}

/** Logs all sets and finishes the workout, through the "Finish workout?"
 *  confirm sheet and the always-shown, always-skippable cool-down card,
 *  ending on Summary. */
export async function finishWorkout(page: Page) {
  await logAllSets(page)
  await page.getByRole('button', { name: 'Finish workout' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Finish workout' }).click()
  await page.getByRole('button', { name: 'Skip cool-down' }).click()
}

/** In the open "Change exercise" sheet, expands the first candidate row and
 *  taps "Use this exercise". */
export async function pickFirstCandidate(page: Page) {
  const sheet = page.getByRole('dialog').filter({ hasText: 'Change exercise' })
  await sheet.getByRole('button', { expanded: false }).first().click()
  await sheet.getByRole('button', { name: 'Use this exercise' }).click()
}
