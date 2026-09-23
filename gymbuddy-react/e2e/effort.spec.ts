import { test, expect } from '@playwright/test'
import { completeOnboarding, onboardOnly } from './helpers'

const EFFORT_LABELS = ['Casual Arc', 'Sigma Arc', 'God Mode', 'Aura Farming']

test('effort chips appear after logging a set and are visible and tappable, for every goal and age', async ({ page }) => {
  await completeOnboarding(page)

  const card = page.locator('section[aria-label]').first()

  // Not shown before any set on this card has been logged.
  await expect(card.getByRole('group', { name: 'Effort for this exercise' })).toHaveCount(0)

  await card.getByRole('button', { name: /not done/ }).first().click()

  const effortGroup = card.getByRole('group', { name: 'Effort for this exercise' })
  await expect(effortGroup).toBeVisible()

  for (const label of EFFORT_LABELS) {
    const chip = effortGroup.getByRole('button', { name: label })
    await expect(chip).toBeVisible()
    await expect(chip).toHaveAttribute('aria-pressed', 'false')
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
  }
})

test('40+ defaults to the Classic effort-label style — still all four levels, just different wording', async ({ page }) => {
  await onboardOnly(page, '55') // 40+ bracket
  // Day-select sheet auto-opens as the first thing after onboarding.
  await page.getByRole('button', { name: /^Legs/ }).click()

  const card = page.locator('section[aria-label]').first()
  await card.getByRole('button', { name: /not done/ }).first().click()

  const effortGroup = card.getByRole('group', { name: 'Effort for this exercise' })
  await expect(effortGroup).toBeVisible()
  for (const label of ['Easy', 'Moderate', 'Hard', 'Maximum']) {
    await expect(effortGroup.getByRole('button', { name: new RegExp(label) })).toBeVisible()
  }
  // The Gen-Z wording (the under-30 default) must NOT appear for this age.
  for (const label of EFFORT_LABELS) {
    await expect(effortGroup.getByRole('button', { name: label })).toHaveCount(0)
  }
})

test('effort-label style is changeable in Settings regardless of age', async ({ page }) => {
  await completeOnboarding(page) // age 28 -> Gen-Z style by default

  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Effort labels' })).toBeVisible()
  await page.getByRole('button', { name: /^Classic/ }).click()

  // "Today" lands back on the Home tab (peekHome stays set), not straight
  // back into the in-progress Workout screen — resume it explicitly.
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await page.getByRole('button', { name: "Resume today's workout" }).click()
  const card = page.locator('section[aria-label]').first()
  await card.getByRole('button', { name: /not done/ }).first().click()
  const effortGroup = card.getByRole('group', { name: 'Effort for this exercise' })
  await expect(effortGroup.getByRole('button', { name: /Easy/ })).toBeVisible()
  await expect(effortGroup.getByRole('button', { name: 'Casual Arc' })).toHaveCount(0)
})
