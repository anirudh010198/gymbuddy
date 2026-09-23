import { test, expect } from '@playwright/test'
import { onboardOnly, startWorkout } from './helpers'

test('a plate tap logs the set instantly (no sheet), labels are consistent, and nothing auto-completes', async ({ page }) => {
  await onboardOnly(page)
  await startWorkout(page)
  const card = page.locator('section[aria-label]').first()
  const plates = card.getByRole('button', { name: /^Set \d/ })

  // Fresh session: nothing is done yet, and every unlogged label says "target".
  for (let i = 0; i < 3; i++) await expect(plates.nth(i)).toHaveAttribute('aria-label', new RegExp(`Set ${i + 1} not done`))
  const labels = card.getByRole('group', { name: 'Log sets' }).locator('button.underline')
  await expect(labels.first()).toContainText('target')

  // Tapping the plate logs instantly — no sheet opens.
  await plates.first().click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(plates.first()).toHaveAttribute('aria-label', 'Set 1 done')
  await expect(labels.first()).not.toContainText('target')

  // The other two sets are still untouched — no auto-completion.
  await expect(plates.nth(1)).toHaveAttribute('aria-label', 'Set 2 not done')
  await expect(plates.nth(2)).toHaveAttribute('aria-label', 'Set 3 not done')
  await expect(labels.nth(1)).toContainText('target')
  await expect(labels.nth(2)).toContainText('target')
})

test('the label opens a sheet with quick chips and number scrollers, and a chip tap applies + closes', async ({ page }) => {
  await onboardOnly(page)
  await startWorkout(page)
  const card = page.locator('section[aria-label]').first()
  const labels = card.getByRole('group', { name: 'Log sets' }).locator('button.underline')

  // First set: no "Same as last set" chip (nothing to copy from yet).
  await labels.first().click()
  await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Same as last set' })).toHaveCount(0)
  await expect(page.getByRole('listbox', { name: 'Reps' })).toBeVisible()
  await page.getByRole('button', { name: '+1 rep' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0) // auto-closed

  // Log set 1, then open set 2's sheet: "Same as last set" now available.
  await card.getByRole('button', { name: 'Set 1 not done' }).click()
  await labels.nth(1).click()
  await expect(page.getByRole('button', { name: 'Same as last set' })).toBeVisible()
  await page.getByRole('button', { name: 'Same as last set' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('the set-logging sheet has no horizontal clipping at 360px', async ({ page }) => {
  await onboardOnly(page)
  await startWorkout(page)
  const card = page.locator('section[aria-label]').first()
  await card.getByRole('group', { name: 'Log sets' }).locator('button.underline').first().click()
  await expect(page.getByRole('listbox', { name: 'Reps' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow).toBe(false)
})
