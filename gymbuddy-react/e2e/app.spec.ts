import { test, expect } from '@playwright/test'
import { completeOnboarding, finishWorkout, pickFirstCandidate } from './helpers'

test('onboarding -> busy swap -> pain swap (safety sheet) -> log all sets -> finish -> summary shows 1/target', async ({ page }) => {
  await completeOnboarding(page)

  await expect(page.getByRole('heading', { name: /Legs day/ })).toBeVisible()
  const cards = page.locator('section[aria-label]')
  await expect(cards).toHaveCount(4) // Quick session

  // Busy swap on the first card: pick a reason, then choose a replacement from the list.
  // The list must cover every available legs exercise, not just the current
  // one's movement pattern — with the default machine+cable+dumbbell
  // equipment, that's 10 legs exercises total (see engine/exercises.ts),
  // so swapping any one of them away always offers the other 9.
  await cards.nth(0).getByRole('button', { name: 'Swap' }).click()
  await page.getByRole('button', { name: /It's busy or not here/ }).click()
  const changeSheet = page.getByRole('dialog').filter({ hasText: 'Change exercise' })
  await expect(page.getByRole('heading', { name: 'Change exercise' })).toBeVisible()
  await expect(changeSheet.getByRole('button', { expanded: false })).toHaveCount(9)
  await pickFirstCandidate(page)
  await expect(cards.nth(0).getByText(/Swapped in for/)).toBeVisible()

  // Pain swap on the second card must always show the safety sheet after picking a replacement.
  await cards.nth(1).getByRole('button', { name: 'Swap' }).click()
  await page.getByRole('button', { name: /It hurts or feels wrong/ }).click()
  await expect(page.getByRole('heading', { name: 'Change exercise' })).toBeVisible()
  await pickFirstCandidate(page)
  await expect(page.getByText(/Sharp pain, joint pain, or pain that doesn't fade/)).toBeVisible()
  await page.getByRole('button', { name: 'Got it' }).click()
  await expect(cards.nth(1).getByText(/Swapped in for/)).toBeVisible()

  await finishWorkout(page)

  await expect(page.getByText('Workout 1 complete')).toBeVisible()
  // Default weekly target is 3; this is the first workout this week.
  await expect(page.getByText(/1\/3 this week/)).toBeVisible()
})

test('resumes an in-progress workout after navigating away and back', async ({ page }) => {
  await completeOnboarding(page)

  const cards = page.locator('section[aria-label]')
  await cards.nth(0).getByRole('button', { name: /not done/ }).first().click()
  await expect(page.getByTestId('sets-progress')).toHaveText('1/12 sets') // 4 exercises x 3 sets

  await page.goto('/')
  await page.goto('/app')

  await expect(page.getByRole('heading', { name: /Legs day/ })).toBeVisible()
  await expect(page.getByTestId('sets-progress')).toHaveText('1/12 sets')
})
