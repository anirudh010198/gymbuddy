import { test, expect } from '@playwright/test'
import { onboardOnly, startWorkout, pickFirstCandidate } from './helpers'

test('/gym-rush loads directly, with an honest empty state when no gym is set', async ({ page }) => {
  await page.goto('/gym-rush')
  await expect(page.getByRole('heading', { name: 'Gym rush hours' })).toBeVisible()
  await expect(page.getByText('No gym set yet.')).toBeVisible()
})

async function setGymManually(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Find my gym' }).click()
  await page.getByRole('button', { name: "Enter my gym's name instead" }).click()
  await page.getByLabel('Gym name').fill(name)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(name)).toBeVisible()
  await page.getByRole('button', { name: 'Today', exact: true }).click()
}

test('an "it\'s busy" swap records a report and tracks the event, once a gym is set', async ({ page }) => {
  await onboardOnly(page)
  await page.keyboard.press('Escape') // close the auto-opened day-select sheet before navigating tabs
  await setGymManually(page, 'Iron Gym Test')
  await startWorkout(page)

  const cards = page.locator('section[aria-label]')
  await cards.nth(0).getByRole('button', { name: 'Swap' }).click()
  await page.getByRole('button', { name: /It's busy or not here/ }).click()
  await pickFirstCandidate(page)

  const busyReports = await page.evaluate(() => JSON.parse(localStorage.getItem('gymbuddy.busy') ?? '[]'))
  expect(busyReports).toHaveLength(1)
  expect(busyReports[0]).toMatchObject({ equipment: expect.any(String), gymCode: expect.any(String) })

  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('gymbuddy.v1') ?? '{}').state.events)
  expect(events.some((e: { type: string }) => e.type === 'busy_reported')).toBe(true)
  expect(events.some((e: { type: string; method?: string }) => e.type === 'gym_located' && e.method === 'manual')).toBe(true)
})

test('forecast line and Change-exercise busy tag appear once there is enough data, and stay away below the threshold', async ({
  page,
}) => {
  await onboardOnly(page)
  await page.keyboard.press('Escape')
  await setGymManually(page, 'Iron Gym Test')
  await startWorkout(page)

  await expect(page.getByText(/Still learning Iron Gym Test's rush hours/)).toBeVisible()

  // Seed 3 same-hour-band reports directly for the session's own first and
  // second exercises (the busy-report recording path is already covered by
  // the test above) so the forecast/tag logic can be checked deterministically,
  // without depending on real wall-clock timing across three separate swaps.
  const [busyItemId, freeItemId] = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('gymbuddy.v1') ?? '{}').state
    return [state.active.items[0].id, state.active.items[1].id]
  })
  await page.evaluate(
    ({ busyItemId, freeItemId }) => {
      const state = JSON.parse(localStorage.getItem('gymbuddy.v1') ?? '{}').state
      const gymCode = state.profile.gymCode
      const now = new Date()
      const base = { gymCode, equipment: 'machine', dayOfWeek: now.getDay(), hourOfDay: now.getHours() }
      const reports = [
        { ...base, exerciseId: busyItemId },
        { ...base, exerciseId: busyItemId },
        { ...base, exerciseId: busyItemId },
        { ...base, exerciseId: freeItemId },
      ]
      localStorage.setItem('gymbuddy.busy', JSON.stringify(reports))
    },
    { busyItemId, freeItemId },
  )

  await page.reload()
  await expect(page.getByText(/Right now at Iron Gym Test:/)).toBeVisible()
  await expect(page.getByText(/usually busy/)).toBeVisible()

  // The Change-exercise tag: swap the FIRST item (not the one we seeded data
  // for) so the second item's exercise shows up as a candidate — it only had
  // 1 seeded report, below the busy threshold, so it should read "usually free".
  const cards = page.locator('section[aria-label]')
  await cards.nth(0).getByRole('button', { name: 'Swap' }).click()
  await page.getByRole('button', { name: /It's busy or not here/ }).click()
  await expect(page.getByRole('heading', { name: 'Change exercise' })).toBeVisible()
  await expect(page.getByText('Usually free now')).toBeVisible()
})
