import { test, expect } from '@playwright/test'
import { onboardOnly } from './helpers'

test('warm-up, rest timer (with resume), transition card, finish-confirm and cool-down all appear in order', async ({ page }) => {
  await onboardOnly(page)
  await page.getByRole('button', { name: /^Legs/ }).click()

  // 2a: warm-up screen is the very first thing, with 3 concrete moves and an
  // always-available skip right next to the primary action.
  await expect(page.getByRole('heading', { name: 'Warm up first' })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Skip warm-up' })).toBeVisible()
  await page.getByRole('button', { name: 'Done warming up' }).click()

  const cards = page.locator('section[aria-label]')
  await expect(cards).toHaveCount(4) // Quick session

  // 2b: "finding your weight" guidance shows before the first set of an
  // untouched exercise.
  await expect(cards.first().getByText(/Finding your weight/)).toBeVisible()

  // 2c: logging a set auto-starts a visible rest countdown with Skip/+30s,
  // and it survives a reload (2g) instead of resetting.
  await cards.first().getByRole('button', { name: /not done/ }).first().click()
  const restBar = cards.first().getByRole('status')
  await expect(restBar).toContainText('Rest ·')
  await expect(restBar.getByRole('button', { name: '+30s' })).toBeVisible()
  await expect(restBar.getByRole('button', { name: 'Skip' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: /Legs day/ })).toBeVisible() // no warm-up screen again
  await expect(cards.first().getByRole('status')).toContainText('Rest ·')
  await cards.first().getByRole('status').getByRole('button', { name: 'Skip' }).click()
  await expect(cards.first().getByRole('status')).toHaveCount(0)

  // 2d: finishing the first exercise surfaces a transition card naming the
  // next one and where its equipment lives, with a Start action.
  await cards.first().getByRole('button', { name: /not done/ }).first().click()
  await cards.first().getByRole('button', { name: /not done/ }).first().click()
  await expect(page.getByText(/Exercise 2 of 4:/)).toBeVisible()
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText(/Exercise 2 of 4:/)).toHaveCount(0)

  // 2e: the dock's finish button (only 3/12 sets logged so far, so it reads
  // "Finish with 3/12 sets") opens an explicit confirmation, never finishes silently.
  await page.getByRole('button', { name: /^Finish/ }).click()
  await expect(page.getByRole('heading', { name: 'Finish workout?' })).toBeVisible()
  await expect(page.getByText(/sets logged/)).toBeVisible()
  await page.getByRole('button', { name: 'Keep going' }).click()
  await expect(page.getByRole('heading', { name: 'Finish workout?' })).toHaveCount(0)

  await page.getByRole('button', { name: /^Finish/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Finish workout' }).click()

  // 2f: a skippable cool-down card comes before Summary.
  await expect(page.getByRole('heading', { name: 'Nice work.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skip cool-down' })).toBeVisible()
  await page.getByRole('button', { name: 'Done — see summary' }).click()
  await expect(page.getByText('Workout 1 complete')).toBeVisible()
})
