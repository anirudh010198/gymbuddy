import { test, expect } from '@playwright/test'
import { onboardOnly } from './helpers'

test('build my own: pick exercises, set sets/reps, start, finish, and repeat the saved workout', async ({ page }) => {
  await onboardOnly(page)

  // The day-select sheet auto-opens as the first thing after onboarding —
  // no "Start today's workout" tap needed (that Dock button sits behind the
  // sheet's backdrop once it's open).
  await page.getByRole('button', { name: /^Build my own/ }).click()

  // Step 0: group.
  await page.getByRole('button', { name: /^Mixed/ }).click()

  // Step 1: pick two exercises from the full library.
  await expect(page.getByRole('heading', { name: 'Pick exercises' })).toBeVisible()
  await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  await expect(page.getByRole('button', { name: /^Continue/ })).toBeEnabled()
  await page.getByRole('button', { name: /^Continue/ }).click()

  // Step 2: sets/reps defaults, then start.
  await expect(page.getByRole('heading', { name: 'Sets & reps' })).toBeVisible()
  await page.getByRole('button', { name: 'Start workout' }).click()

  await expect(page.getByRole('heading', { name: 'Your workout' })).toBeVisible()
  const cards = page.locator('section[aria-label]')
  await expect(cards).toHaveCount(2)

  // Log every set on both cards, finish, and confirm it counted toward the week.
  const count = await cards.count()
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i)
    while ((await card.getByRole('button', { name: /not done/ }).count()) > 0) {
      await card.getByRole('button', { name: /not done/ }).first().click()
      await page.waitForTimeout(60)
    }
  }
  await page.getByRole('button', { name: 'Finish workout' }).click()
  await expect(page.getByText('Workout 1 complete')).toBeVisible()
  await expect(page.getByText(/1\/3 this week/)).toBeVisible()
  await page.getByRole('button', { name: 'Done', exact: true }).click()

  // Repeat shortcut: same picks, no picker.
  await page.getByRole('button', { name: 'Train again anyway' }).click()
  await expect(page.getByRole('button', { name: /^Repeat my last custom workout/ })).toBeVisible()
  await page.getByRole('button', { name: /^Repeat my last custom workout/ }).click()
  await expect(page.getByRole('heading', { name: 'Your workout' })).toBeVisible()
  await expect(cards).toHaveCount(2)
})
