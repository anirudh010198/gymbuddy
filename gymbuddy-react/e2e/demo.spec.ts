import { test, expect } from '@playwright/test'

test('demo mode shows a seeded 3-week-old account, never touches real data, and exits cleanly', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /See a 3-week-old account/ }).click()

  // Lands mid-way through today's (already in-progress) session — the
  // "Demo data" badge and 4-exercise Quick session should be visible
  // immediately, no onboarding.
  await expect(page.getByText('Demo data')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Exit demo' })).toBeVisible()
  const cards = page.locator('section[aria-label]')
  await expect(cards).toHaveCount(4)

  // Today tab: 2-week streak, filled calendar, resumable session.
  await page.getByRole('button', { name: 'Go to Today' }).click()
  await expect(page.getByTestId('week-streak')).toHaveText('2')
  await expect(page.getByText('Workout in progress')).toBeVisible()
  await expect(page.getByRole('button', { name: "Resume today's workout" })).toBeVisible()

  // History: 9 seeded workouts, with PBs and effort labels shown.
  await page.getByRole('button', { name: 'History', exact: true }).click()
  await expect(page.getByText('★ PB').first()).toBeVisible()
  await expect(page.getByText(/Casual Arc|Sigma Arc|God Mode|Aura Farming/).first()).toBeVisible()

  // Exit demo lands on the real (unseeded) /app — proves the demo never
  // touched the real localStorage-backed store.
  await page.getByRole('link', { name: 'Exit demo' }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Walk in.' })).toBeVisible()
  await expect(page.getByText('Demo data')).toHaveCount(0)
})
