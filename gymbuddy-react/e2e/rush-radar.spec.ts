import { test, expect } from '@playwright/test'
import { onboardOnly } from './helpers'

test('all 4 bottom-nav tabs are visible and tappable at 360px, and the Rush Radar tab holds everything gym-related', async ({
  page,
}) => {
  await onboardOnly(page)
  await page.keyboard.press('Escape')

  const nav = page.getByRole('navigation', { name: 'Primary' })
  for (const label of ['Today', 'Rush Radar', 'History', 'Settings']) {
    await expect(nav.getByRole('button', { name: label, exact: true })).toBeVisible()
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow).toBe(false)

  await nav.getByRole('button', { name: 'Rush Radar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Rush Radar' })).toBeVisible()
  await expect(page.getByText('Know which machines are free before you walk in.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Find my gym' })).toBeVisible()
  await expect(page.getByText('Your equipment')).toBeVisible()
  // Equipment stays editable only in Settings, not duplicated here.
  await expect(page.getByRole('button', { name: 'Change in Settings' })).toBeVisible()

  for (const gym of ['Budget gym', 'Premium gym', 'Society gym', '24-hour gym']) {
    await expect(page.getByRole('button', { name: gym })).toBeVisible()
  }
  await page.getByRole('button', { name: 'Budget gym' }).click()
  await expect(page.getByRole('button', { name: 'Budget gym' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText(/Busy right now|Quiet right now/)).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByText(/illustrative sample pattern/i)).toBeVisible()

  // Settings no longer has its own gym section.
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your gym' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Find my gym' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Equipment' })).toBeVisible() // still here, editable
})
