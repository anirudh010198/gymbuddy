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

/** Completes onboarding with the first goal option and default equipment/target,
 *  then opens the day-select sheet and starts a workout (onboarding no longer
 *  auto-starts one). Defaults to a Legs day — the suggested first day when no
 *  group has been trained yet — at whatever session length is pre-selected
 *  (Quick for the first two workouts). */
export async function completeOnboarding(page: Page) {
  await page.goto('/app')
  await page.locator('button[aria-pressed]').first().click() // first goal chip
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click()
  await startWorkout(page)
}

/** Opens the Home day-select sheet and starts a workout for the given day.
 *  Regex name match: the day buttons also contain a muscle sub-label and,
 *  for the suggested day, a "Suggested" badge — so an exact match would fail. */
export async function startWorkout(page: Page, day: 'Legs' | 'Push' | 'Pull' = 'Legs') {
  await page.getByRole('button', { name: "Start today's workout" }).click()
  await page.getByRole('button', { name: new RegExp(`^${day}`) }).click()
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

/** Logs all sets and finishes the workout, ending on the Summary screen. */
export async function finishWorkout(page: Page) {
  await logAllSets(page)
  await page.getByRole('button', { name: 'Finish workout' }).click()
}

/** In the open "Change exercise" sheet, expands the first candidate row and
 *  taps "Use this exercise". */
export async function pickFirstCandidate(page: Page) {
  const sheet = page.getByRole('dialog').filter({ hasText: 'Change exercise' })
  await sheet.getByRole('button', { expanded: false }).first().click()
  await sheet.getByRole('button', { name: 'Use this exercise' }).click()
}
