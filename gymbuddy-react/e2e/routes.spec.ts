import { test, expect } from '@playwright/test'

/** Every real route in the app (see src/App.tsx) — a direct hit / hard
 *  refresh on each must render, with zero console errors, for a brand-new
 *  visitor with empty storage (a fresh Playwright context, same as this).
 *  NOTE: the section-4 spec's route checklist also lists "/tour", which
 *  does not exist anywhere in this codebase and was never specified
 *  anywhere else in the 4-section request — deliberately not fabricated,
 *  see the final report. */
const ROUTES: { path: string; heading: RegExp }[] = [
  { path: '/', heading: /Walk in\./ },
  { path: '/app', heading: /Never wonder what to do|Walk in\.|Today|Warm up|Nice work/ },
  { path: '/demo', heading: /Legs day|Push day|Pull day/ },
  { path: '/exercises', heading: /All exercises/ },
  { path: '/case-study', heading: /./ },
  { path: '/gym-rush', heading: /Rush Radar/ },
  { path: '/privacy', heading: /Privacy/ },
  { path: '/team', heading: /./ },
]

for (const { path, heading } of ROUTES) {
  test(`${path} loads directly with no console errors, and survives a hard refresh`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto(path)
    await expect(page.getByRole('heading').first()).toBeVisible()
    if (heading.source !== '.') await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading').first()).toBeVisible()

    expect(errors, `console errors on ${path}: ${errors.join('\n')}`).toEqual([])
  })
}
