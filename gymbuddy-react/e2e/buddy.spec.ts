import { test, expect, type Page } from '@playwright/test'
import { onboardOnly, startWorkout, finishWorkout } from './helpers'

async function openHomeBuddySheet(page: Page) {
  await page.keyboard.press('Escape') // close the auto-opened day-select sheet
  await page.getByRole('button', { name: 'Train with a buddy' }).click()
}

/** Stubs navigator.share to record the shared text instead of opening a
 *  real native share sheet — installed before any page script runs, so
 *  every buddy action (invite, reply, nudge) is capturable and deterministic. */
async function stubShare(page: Page) {
  await page.addInitScript(() => {
    // @ts-expect-error test-only stub
    window.__shares = []
    // @ts-expect-error overriding for the test
    navigator.share = async (data: { text?: string }) => {
      // @ts-expect-error test-only stub
      window.__shares.push(data.text ?? '')
    }
  })
}

async function lastShareLink(page: Page): Promise<string> {
  const text = await page.evaluate(() => {
    // @ts-expect-error test-only stub
    return window.__shares[window.__shares.length - 1] as string
  })
  const match = text.match(/https?:\/\/\S+/)
  if (!match) throw new Error(`no link found in shared text: ${text}`)
  return match[0]
}

test.describe('Buddy mode', () => {
  test('two people pair via a shared invite link and end up mutually paired, with never any weight data shared', async ({
    browser,
  }) => {
    const ctxA = await browser.newContext()
    const ctxB = await browser.newContext()
    const pageA = await ctxA.newPage()
    const pageB = await ctxB.newPage()
    await stubShare(pageA)
    await stubShare(pageB)

    // Device A: onboard, do a workout (so the invite carries real progress),
    // then generate and share an invite.
    await onboardOnly(pageA)
    await startWorkout(pageA)
    await finishWorkout(pageA)
    await pageA.getByRole('button', { name: 'Done', exact: true }).click()

    await openHomeBuddySheet(pageA)
    await pageA.getByRole('button', { name: 'Invite a buddy' }).click()
    await pageA.getByLabel('Your name').fill('Anirudh')
    await pageA.getByRole('button', { name: 'Continue' }).click()
    await expect(pageA.getByRole('heading', { name: 'Your invite' })).toBeVisible()
    const codeA = await pageA.getByTestId('invite-code').textContent()
    expect(codeA).toMatch(/^[A-Z2-9]{6}$/)

    await pageA.getByRole('button', { name: 'Share invite' }).click()
    const linkA = await lastShareLink(pageA)
    expect(linkA).toContain('buddyCode=')
    expect(linkA).not.toMatch(/kg|weight/i) // never weight data in the payload

    // Device B: onboard, open A's link directly (as if tapped from WhatsApp).
    await onboardOnly(pageB)
    await pageB.keyboard.press('Escape')
    await pageB.goto(linkA)

    await expect(pageB.getByRole('heading', { name: 'Pair with Anirudh?' })).toBeVisible()
    await pageB.getByRole('button', { name: 'Pair up' }).click()
    await expect(pageB.getByRole('heading', { name: "You're paired with Anirudh!" })).toBeVisible()

    // B sends the reply back to complete the mutual pairing.
    await pageB.getByRole('button', { name: 'Send it back' }).click()
    await pageB.getByLabel('Your name').fill('Priya')
    await pageB.getByRole('button', { name: 'Continue' }).click()
    const linkB = await lastShareLink(pageB)
    expect(linkB).toContain('buddyRole=reply')

    // B is already paired at this point — the strip shows Anirudh directly
    // on Home, no need to reopen the sheet.
    await expect(pageB.getByText('Anirudh')).toBeVisible()

    // Device A accepts B's reply to complete pairing on A's side too.
    await pageA.goto(linkB)
    await expect(pageA.getByRole('heading', { name: 'Pair with Priya?' })).toBeVisible()
    await pageA.getByRole('button', { name: 'Pair up' }).click()

    // A is now paired too — no "share back" prompt for a reply (would loop),
    // and the strip shows Priya directly on Home.
    await expect(pageA.getByRole('heading', { name: "You're paired with Priya!" })).toHaveCount(0)
    await expect(pageA.getByText('Priya')).toBeVisible()

    // Never weights or how heavy either lifts anywhere in the buddy strip/sheet.
    await expect(pageA.getByText(/kg/i)).toHaveCount(0)

    await ctxA.close()
    await ctxB.close()
  })

  test('the buddy strip shows the comparison and the inactivity nudge, capped at once a day', async ({ page }) => {
    await onboardOnly(page)
    await page.keyboard.press('Escape')

    // Seed a buddy directly (deterministic — the pairing handshake itself is
    // covered by the test above) who hasn't trained in 6 days.
    await page.evaluate(() => {
      const buddy = {
        name: 'Priya',
        workoutsThisWeek: 1,
        weekTarget: 3,
        streak: 2,
        lastTrainedDate: new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10),
        code: 'ABCD23',
        pairedAt: Date.now(),
        lastNudgeSentAt: null,
      }
      localStorage.setItem('gymbuddy.buddy', JSON.stringify(buddy))
    })
    await page.reload()
    // The day-select sheet re-auto-opens on every fresh Home mount — wait
    // for it before closing it, or the Escape can race its own open effect.
    await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: 'What are you training today?' })).toHaveCount(0)

    await expect(page.getByText('Priya').first()).toBeVisible()
    await expect(page.getByText(/1\/3 this week/)).toBeVisible()
    await expect(page.getByText("Priya hasn't trained this week. Send them a nudge?")).toBeVisible()

    const nudgeButton = page.getByRole('button', { name: 'Nudge Priya' })
    await expect(nudgeButton).toBeEnabled()
    await nudgeButton.click()
    await expect(page.getByRole('button', { name: 'Already nudged today' })).toBeVisible()

    const events = await page.evaluate(() => JSON.parse(localStorage.getItem('gymbuddy.v1') ?? '{}').state.events)
    expect(events.some((e: { type: string }) => e.type === 'buddy_nudge_sent')).toBe(true)
  })

  test('unpairing clears the local buddy record entirely', async ({ page }) => {
    await onboardOnly(page)
    await page.keyboard.press('Escape')
    await page.evaluate(() => {
      localStorage.setItem(
        'gymbuddy.buddy',
        JSON.stringify({
          name: 'Priya',
          workoutsThisWeek: 1,
          weekTarget: 3,
          streak: 2,
          lastTrainedDate: null,
          code: 'ABCD23',
          pairedAt: Date.now(),
          lastNudgeSentAt: null,
        }),
      )
    })
    await page.reload()
    // The day-select sheet re-auto-opens on every fresh Home mount — wait
    // for it before closing it, or the Escape can race its own open effect.
    await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: 'What are you training today?' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Manage buddy' }).click()
    await page.getByRole('button', { name: 'Unpair' }).click()
    await page.getByRole('button', { name: 'Unpair', exact: true }).click()

    const stored = await page.evaluate(() => localStorage.getItem('gymbuddy.buddy'))
    expect(stored).toBeNull()

    // Close the sheet to see Home's own strip refresh behind it.
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Train with a buddy' })).toBeVisible()
  })

  test('the buddy strip and sheet show no horizontal clipping at 360px, even with a long name', async ({ page }) => {
    await onboardOnly(page)
    await page.keyboard.press('Escape')
    await page.evaluate(() => {
      localStorage.setItem(
        'gymbuddy.buddy',
        JSON.stringify({
          name: 'Alexandria Christodoulopoulos',
          workoutsThisWeek: 3,
          weekTarget: 3,
          streak: 12,
          lastTrainedDate: new Date().toISOString().slice(0, 10),
          code: 'ABCD23',
          pairedAt: Date.now(),
          lastNudgeSentAt: null,
        }),
      )
    })
    await page.reload()
    await expect(page.getByRole('heading', { name: 'What are you training today?' })).toBeVisible()
    await page.keyboard.press('Escape')

    const noOverflow = async () => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      expect(overflow).toBe(false)
    }

    await expect(page.getByText('Alexandria Christodoulopoulos').first()).toBeVisible()
    await noOverflow()

    await page.getByRole('button', { name: 'Manage buddy' }).click()
    await expect(page.getByRole('heading', { name: 'Your buddy' })).toBeVisible()
    await noOverflow()
  })

  test('demo mode seeds a buddy (Priya) who has gone quiet, isolated from real data', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /See a 3-week-old account/ }).click()
    await page.getByRole('button', { name: 'Go to Today' }).click()

    await expect(page.getByText('Priya').first()).toBeVisible()
    await expect(page.getByText(/hasn't trained this week/)).toBeVisible()

    await page.getByRole('link', { name: 'Exit demo' }).click()
    await page.goto('/app')
    const stored = await page.evaluate(() => localStorage.getItem('gymbuddy.buddy'))
    expect(stored).toBeNull() // demo's buddy never touched the real gymbuddy.buddy key
  })
})
