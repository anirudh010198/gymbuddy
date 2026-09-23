import { test, expect } from '@playwright/test'
import { EXERCISES } from '../src/engine/exercises'

const CORE_COUNT = EXERCISES.filter((e) => e.equip !== 'bodyweight').length

test('all 24 core exercises are reachable via /exercises (no filters applied)', async ({ page }) => {
  expect(CORE_COUNT).toBe(24)
  await page.goto('/exercises')
  // Every exercise (core + bodyweight fallbacks) renders as an expandable
  // row — count them by their expand toggles.
  const rows = page.getByRole('button', { expanded: false })
  await expect(rows).toHaveCount(EXERCISES.length)
  // Spot-check a couple of core (non-bodyweight) exercises by name are
  // actually present, not just counted.
  await expect(page.getByText('Leg Press', { exact: true })).toBeVisible()
  await expect(page.getByText('Goblet Squat', { exact: true })).toBeVisible()
})

test('no dead ends: Intro, Rush Radar, and the buddy/gym sheets always have a way forward and back', async ({ page }) => {
  // Intro: Skip is always present, even mid-way through the cards.
  await page.goto('/app')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip' }).click()

  // Continue through onboarding manually — the intro was already dismissed
  // above, so the onboardOnly() helper (which also skips it) doesn't apply.
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel('Your age').fill('28')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click()
  await page.getByRole('button', { name: 'Continue without an account' }).click()
  await page.keyboard.press('Escape')

  // Rush Radar: chrome (top bar + bottom nav) present, and the gym-picker
  // sheet always has a close/back path even mid-flow.
  await page.getByRole('button', { name: 'Rush Radar', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await page.getByRole('button', { name: 'Find my gym' }).click()
  await page.getByRole('button', { name: "Enter my gym's name instead" }).click()
  await expect(page.getByRole('button', { name: /Skip|Enter my gym|Save/ }).first()).toBeVisible()
  await page.keyboard.press('Escape') // dialog always dismissible

  // Buddy sheet: every step has a real way back to menu/paired, never a trap.
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'What are you training today?' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Train with a buddy' }).click()
  await page.getByRole('button', { name: 'I have an invite' }).click()
  await expect(page.getByRole('heading', { name: 'Enter their invite' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Bottom nav still reaches every tab from here — nothing got stuck.
  for (const label of ['Today', 'Rush Radar', 'History', 'Settings']) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  }
})
