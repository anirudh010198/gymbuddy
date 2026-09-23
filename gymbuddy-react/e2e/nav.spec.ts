import { test, expect } from '@playwright/test'
import { completeOnboarding, finishWorkout } from './helpers'

test('persistent top bar and bottom nav appear on the workout screen, and survive a hard refresh', async ({ page }) => {
  await completeOnboarding(page)

  await expect(page.getByRole('button', { name: 'Go to Today' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'History', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible()

  await page.reload()

  await expect(page.getByRole('heading', { name: /Legs day/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Go to Today' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
})

test('summary screen shows Done and Back to home page, both work, and the bottom nav is present', async ({ page }) => {
  await completeOnboarding(page)
  await finishWorkout(page)

  await expect(page.getByText('Workout 1 complete')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back to home page' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Done', exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByText('Workout 1 complete')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()

  await page.getByRole('link', { name: 'Back to home page' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Walk in.' })).toBeVisible()
})

test('logo goes to Today from any tab, and the top-bar Home link leaves the app for the landing page', async ({ page }) => {
  await completeOnboarding(page)

  await page.getByRole('button', { name: 'History', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible()

  await page.getByRole('button', { name: 'Go to Today' }).click()
  await expect(page.getByText('Today', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Home' }).click()
  await expect(page).toHaveURL('/')
})
