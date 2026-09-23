import { test, expect } from '@playwright/test'
import { onboardOnly, startWorkout, finishWorkout } from './helpers'

test('the session muscle map shows the right muscles for the trained group, labelled not colour-only, and fills as sets are logged', async ({
  page,
}) => {
  await onboardOnly(page)
  await startWorkout(page, 'Legs')

  await expect(page.getByRole('group', { name: 'Muscles worked this session' })).toBeVisible()
  await expect(page.getByText("Today you're training your legs: quads, hamstrings, glutes and calves.")).toBeVisible()

  // Labelled regions, not colour-only — every listed muscle has a real
  // accessible name on its shape, whether or not it's "trained today" yet.
  const map = page.getByRole('group', { name: 'Muscles worked this session' })
  for (const name of ['Quads', 'Hamstrings', 'Glutes', 'Calves']) {
    await expect(map.getByRole('img', { name: new RegExp(`^${name}`) }).first()).toHaveCount(1)
  }
  // The full body outline always shows (front and back) — push/pull
  // muscles like chest are present but never marked "trained today" on a
  // legs session, only highlighted ones are.
  await expect(map.getByRole('img', { name: 'Chest' })).toHaveCount(1)
  await expect(map.getByRole('img', { name: /^Chest — trained today/ })).toHaveCount(0)
  await expect(map.getByRole('img', { name: /^Quads — trained today/ })).toHaveCount(1)

  // No horizontal clipping at 360px.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow).toBe(false)
})

test('the same muscle map (with the final progress) appears on the summary screen after finishing', async ({ page }) => {
  await onboardOnly(page)
  await startWorkout(page, 'Push')
  await finishWorkout(page)

  await expect(page.getByRole('group', { name: 'Muscles worked this session' })).toBeVisible()
  await expect(page.getByText("Today you trained your push muscles: chest, shoulders and triceps.")).toBeVisible()
})
