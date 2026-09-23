import { test, expect } from '@playwright/test'

test('demo mode opens on Today with seeded data, never touches real data, and exits cleanly', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /See a 3-week-old account/ }).click()

  // Opens directly on Today; the in-progress session can be resumed using
  // the ordinary app action. The banner and sample-gym forecast are present.
  await expect(page.getByText('Demo data')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Exit demo' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await expect(page.getByTestId('week-streak')).toHaveText('2')
  await expect(page.getByText('Workout in progress')).toBeVisible()
  await expect(page.getByRole('button', { name: "Resume today's workout" })).toBeVisible()

  await page.getByRole('button', { name: 'Rush Radar', exact: true }).click()
  await expect(page.getByText(/Right now at Iron Temple Fitness:/)).toBeVisible()
  await expect(page.getByText(/usually busy/)).toBeVisible()

  await page.getByRole('button', { name: 'Go to Today' }).click()

  // History: 9 seeded workouts, with PBs, effort labels, and unlocked bonus
  // tips shown.
  await page.getByRole('button', { name: 'History', exact: true }).click()
  await expect(page.getByText('★ PB').first()).toBeVisible()
  await expect(page.getByText(/Casual Arc|Sigma Arc|God Mode|Aura Farming/).first()).toBeVisible()
  await expect(page.getByText('My tips')).toBeVisible()

  // Settings: the sample gym is already set.
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(page.getByText('Iron Temple Fitness').first()).toBeVisible()

  // Exit demo lands on the real landing page, not just back into /app.
  await page.getByRole('link', { name: 'Exit demo' }).click()
  await expect(page).toHaveURL('http://localhost:5180/')
  await expect(page.getByRole('heading', { name: 'Walk in.' })).toBeVisible()
  await expect(page.getByText('Demo data')).toHaveCount(0)

  // Proves the demo never touched the real localStorage-backed store: a
  // fresh /app still starts at onboarding.
  await page.goto('/app')
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
})

test('Exit demo works from every screen, and always leaves real data untouched', async ({ page }) => {
  const destinations: { tab?: 'History' | 'Settings' }[] = [{}, { tab: 'History' }, { tab: 'Settings' }]

  for (const { tab } of destinations) {
    await page.goto('/')
    await page.getByRole('link', { name: /See a 3-week-old account/ }).click()
    await expect(page.getByText('Demo data')).toBeVisible()

    if (tab) {
      await page.getByRole('button', { name: 'Go to Today' }).click()
      await page.getByRole('button', { name: tab, exact: true }).click()
    }

    await expect(page.getByRole('link', { name: 'Exit demo' })).toBeVisible()
    await page.getByRole('link', { name: 'Exit demo' }).click()
    await expect(page).toHaveURL('http://localhost:5180/')
    await expect(page.getByText('Demo data')).toHaveCount(0)
  }

  // After all that demo activity, the real account is still untouched.
  await page.goto('/app')
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
})
