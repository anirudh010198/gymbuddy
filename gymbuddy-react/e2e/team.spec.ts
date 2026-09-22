import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('team export produces a valid research.json', async ({ page }) => {
  await page.goto('/team')

  await page.getByLabel('First name', { exact: true }).fill('Asha')
  await page.getByLabel('Where they train').selectOption('Budget gym')
  await page.getByLabel('Key observation (what you saw, not what they said)').fill('Walked straight to the one machine they knew.')
  await page.getByLabel('Main frustration, in one line').fill("Doesn't know what else to do.")
  await page.getByRole('button', { name: 'Save interview' }).click()
  await expect(page.getByText('Asha', { exact: true })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export research.json' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('research.json')

  const path = await download.path()
  const content = JSON.parse(await readFile(path!, 'utf-8'))

  // Exact shape CLAUDE.md section 8 specifies.
  for (const key of ['interviews', 'insights', 'killedHypothesis', 'funnel', 'metrics', 'iteration']) {
    expect(content).toHaveProperty(key)
  }
  expect(Array.isArray(content.interviews)).toBe(true)
  expect(content.interviews).toHaveLength(1)
  expect(content.interviews[0].name).toBe('Asha')
  expect(content.interviews[0].venue).toBe('Budget gym')
  for (const key of ['approached', 'tried', 'completed', 'wouldReuse', 'returned']) {
    expect(content.funnel).toHaveProperty(key)
  }
  for (const key of ['week1Repeat', 'swapConversion', 'setCompletion', 'sampleSize']) {
    expect(content.metrics).toHaveProperty(key)
  }
})
