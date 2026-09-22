import { test, expect } from '@playwright/test'
import { finishWorkout, mockDate } from './helpers'

test('streak counts a completed week, and a rest day / unfinished new week never resets it', async ({ page }) => {
  await mockDate(page, '2026-09-07T09:00:00') // Monday, week 1
  await page.goto('/app')
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Build my plan' }).click() // weekly target defaults to 3

  async function doWorkoutAndReturnHome() {
    await finishWorkout(page)
    await page.getByRole('button', { name: 'Done', exact: true }).click()
  }

  await doWorkoutAndReturnHome() // Monday: 1/3

  await mockDate(page, '2026-09-09T09:00:00') // Wednesday (Tuesday was a rest day)
  await page.reload()
  await page.getByRole('button', { name: "Start today's workout" }).click()
  await doWorkoutAndReturnHome() // Wednesday: 2/3

  await mockDate(page, '2026-09-11T09:00:00') // Friday
  await page.reload()
  await page.getByRole('button', { name: "Start today's workout" }).click()
  await doWorkoutAndReturnHome() // Friday: 3/3 -> week 1 target met

  await expect(page.getByTestId('week-streak')).toHaveText('1')

  // Jump to the following Monday (week 2) without training yet — an unfinished new
  // week must not reset the streak point already earned last week.
  await mockDate(page, '2026-09-14T09:00:00')
  await page.reload()

  await expect(page.getByTestId('week-count')).toContainText('0')
  await expect(page.getByTestId('week-streak')).toHaveText('1')
})
