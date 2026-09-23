import { test, expect } from '@playwright/test'

test('reduced-motion preference disables smooth scrolling in the app', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/demo')

  const motionPreference = await page.evaluate(() => ({
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }))
  expect(motionPreference).toEqual({ reduced: true, scrollBehavior: 'auto' })
  await expect(page.getByText('Demo data')).toBeVisible()
})
