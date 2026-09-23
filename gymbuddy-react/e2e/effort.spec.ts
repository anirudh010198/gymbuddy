import { test, expect } from '@playwright/test'
import { completeOnboarding } from './helpers'

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

test('effort chips show regardless of age — age only changes rest timing', async ({ page }) => {
  await page.goto('/app')
  await page.locator('button[aria-pressed]').first().click() // first goal chip
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Your age (optional)').fill('55') // 40+ bracket: longer rest, warm-up prompt
  await page.getByRole('button', { name: 'Build my plan' }).click()
  await page.getByRole('button', { name: "Start today's workout" }).click()
  await page.getByRole('button', { name: /^Legs/ }).click()

  const card = page.locator('section[aria-label]').first()
  await card.getByRole('button', { name: /not done/ }).first().click()

  const effortGroup = card.getByRole('group', { name: 'Effort for this exercise' })
  await expect(effortGroup).toBeVisible()
  for (const label of EFFORT_LABELS) {
    await expect(effortGroup.getByRole('button', { name: label })).toBeVisible()
  }
})
