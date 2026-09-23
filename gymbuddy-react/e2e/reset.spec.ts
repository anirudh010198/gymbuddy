import { test, expect } from '@playwright/test'
import { completeOnboarding, finishWorkout } from './helpers'

test('reset all data: confirm, clears everything, and the app is genuinely back at onboarding', async ({ page }) => {
  await completeOnboarding(page)
  await finishWorkout(page)
  await expect(page.getByText('Workout 1 complete')).toBeVisible()
  await page.getByRole('button', { name: 'Done', exact: true }).click()

  // Seed a paired buddy too — reset must sweep every gymbuddy.* key, not
  // just the ones it happens to know about by name.
  await page.evaluate(() => {
    localStorage.setItem(
      'gymbuddy.buddy',
      JSON.stringify({ name: 'Priya', workoutsThisWeek: 1, weekTarget: 3, streak: 1, lastTrainedDate: null, code: 'ABCD23', pairedAt: Date.now() }),
    )
  })

  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Reset all data' }).click()
  await expect(page.getByText("This deletes your workouts, streaks and settings on this device. This can't be undone.")).toBeVisible()

  await page.getByRole('button', { name: 'Delete everything' }).click()

  // A real navigation (not client-side routing) is what actually leaves no
  // stale React/store state behind — assert the URL itself changed to "/".
  await page.waitForURL('**/')
  await expect(page.getByRole('heading', { name: 'Walk in.' })).toBeVisible()

  // And the reset is real, not just a visual reset: /app shows onboarding
  // from scratch, with zero history — not a stale in-memory profile.
  await page.goto('/app')
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  const buddy = await page.evaluate(() => localStorage.getItem('gymbuddy.buddy'))
  expect(buddy).toBeNull()
})
