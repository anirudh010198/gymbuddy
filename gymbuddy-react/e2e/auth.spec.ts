import { test, expect } from '@playwright/test'

// This environment has no live Supabase project configured (no
// VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY), so these tests cover exactly
// what's testable without one: the sign-in screen appears at the right
// point and never blocks anything, and both it and Settings degrade
// gracefully when accounts aren't configured. Real Google/magic-link
// sign-in against a live project needs manual verification once Supabase
// is actually set up — see the setup steps in the reply this was built for.

test('the sign-in screen is the first thing after onboarding, and skipping it never blocks the workout', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel('Your age').fill('28')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click()

  await expect(page.getByRole('heading', { name: 'Sign in to save your progress.' })).toBeVisible()
  // No backend configured in this environment — degrades to a plain message,
  // not a broken Google/email form.
  await expect(page.getByText("Accounts aren't set up on this deployment yet")).toBeVisible()
  // The bottom nav must NOT show here — this is a continuation of onboarding.
  await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Continue without an account' }).click()

  // Straight to the day-select sheet — the workout was never blocked.
  await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
})

test('Settings shows "not signed in" with the same graceful degradation when accounts are unconfigured', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel('Your age').fill('28')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click()
  await page.getByRole('button', { name: 'Continue without an account' }).click()

  await page.getByRole('button', { name: /^Legs/ }).click() // dismiss the day-select sheet
  await page.getByRole('button', { name: 'Settings', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()
  await expect(page.getByText('Not signed in.')).toBeVisible()
  await expect(page.getByText("Accounts aren't set up on this deployment yet")).toBeVisible()
  // No sign-out or delete-account controls while signed out.
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Delete my account and data' })).toHaveCount(0)
})
