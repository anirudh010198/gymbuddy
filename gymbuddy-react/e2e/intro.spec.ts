import { test, expect } from '@playwright/test'
import { onboardOnly } from './helpers'

test('a brand-new visitor sees the 3-card intro before onboarding, once, with Skip always available', async ({ page }) => {
  await page.goto('/app')
  await expect(page.getByRole('heading', { name: 'Never wonder what to do at the gym.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible()

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Machine busy? Tap once.' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Rush Radar knows your gym.' })).toBeVisible()

  await page.getByRole('button', { name: "Let's go" }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()

  // Never shown again on a later visit.
  await page.goto('/app')
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Never wonder what to do at the gym.' })).toHaveCount(0)
})

test('Skip on the intro goes straight to onboarding', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
})

test('"Show intro again" in Settings brings it back for an existing user, and returns to Home afterward', async ({ page }) => {
  await onboardOnly(page)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Show intro again' }).click()

  await expect(page.getByRole('heading', { name: 'Never wonder what to do at the gym.' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip' }).click()

  // Back to the app, not re-onboarding — this user already has a profile.
  await expect(page.getByRole('button', { name: 'Get started' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
})
