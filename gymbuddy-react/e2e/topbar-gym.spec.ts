import { test, expect } from '@playwright/test'
import { onboardOnly } from './helpers'

async function noHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow).toBe(false)
}

test('the top bar shows "Set your gym" with no clipping at 360px, before a gym is set', async ({ page }) => {
  await onboardOnly(page)
  await expect(page.getByRole('button', { name: 'Set your gym' })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('the top bar shows the gym name (even a long one) and a status dot, with no clipping at 360px', async ({ page }) => {
  await onboardOnly(page)
  // Close the auto-opened day-select sheet first — wait for it to actually
  // be open before pressing Escape, or the Escape can race its own open effect.
  await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'What are you training today?' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Set your gym' }).click() // top-bar shortcut into Rush Radar
  await expect(page.getByRole('heading', { name: 'Rush Radar' })).toBeVisible()
  await page.getByRole('button', { name: 'Find my gym' }).click()
  await page.getByRole('button', { name: "Enter my gym's name instead" }).click()
  await page.getByLabel('Gym name').fill('The Extremely Long Name Fitness & Strength Centre')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByRole('button', { name: /The Extremely Long Name/ })).toBeVisible()
  await noHorizontalOverflow(page)

  // Seed 3 same-hour reports so the status dot actually renders, and check
  // it doesn't push the bar into overflow either.
  const gymCode = await page.evaluate(() => JSON.parse(localStorage.getItem('gymbuddy.v1') ?? '{}').state.profile.gymCode)
  await page.evaluate((gymCode) => {
    const now = new Date()
    const base = { gymCode, equipment: 'machine', exerciseId: 'leg_press', dayOfWeek: now.getDay(), hourOfDay: now.getHours() }
    localStorage.setItem('gymbuddy.busy', JSON.stringify([base, base, base]))
  }, gymCode)
  await page.reload()
  await expect(page.locator('header, div').filter({ hasText: 'The Extremely Long Name' }).first()).toBeVisible()
  await noHorizontalOverflow(page)
})

test('the landing page nav and hero show no horizontal clipping at 360px', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Walk in.' })).toBeVisible()
  await noHorizontalOverflow(page)
})
