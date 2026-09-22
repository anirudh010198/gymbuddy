/** Draws a clean, on-brand share card (no personal data — just the numbers) with
 *  the native Canvas API, so sharing a workout doesn't require a new dependency. */

const RUBBER = '#1E2B30'
const CHALK = '#EEF1EC'
const PLATE = '#F2C230'
const IRON = '#9FB0B4'

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = word
      curY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, curY)
  return curY
}

export interface ShareCardStats {
  workoutNumber: number
  reps: number
  volume: number
  streak: number
}

export async function buildShareImage(stats: ShareCardStats): Promise<Blob | null> {
  try {
    await document.fonts.ready
  } catch {
    /* font loading API unavailable — draw with whatever's loaded */
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = RUBBER
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Plate motif (a circle with a centre hole), reused sparingly per the design system.
  ctx.strokeStyle = PLATE
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(150, 150, 66, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(150, 150, 22, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = CHALK
  ctx.font = '600 38px Barlow, sans-serif'
  ctx.fillText('GYMBUDDY', 250, 163)

  ctx.fillStyle = PLATE
  ctx.font = '800 90px "Barlow Condensed", sans-serif'
  wrapText(ctx, `Workout ${stats.workoutNumber} complete`, 80, 400, 920, 96)

  const rows: [string, string][] = [
    [String(stats.reps), 'reps'],
    [`${stats.volume.toLocaleString()}`, 'kg lifted'],
    [String(stats.streak), 'week streak'],
  ]
  let y = 700
  for (const [big, label] of rows) {
    ctx.fillStyle = PLATE
    ctx.font = '800 130px "Barlow Condensed", sans-serif'
    ctx.fillText(big, 80, y)
    ctx.fillStyle = IRON
    ctx.font = '600 34px Barlow, sans-serif'
    ctx.fillText(label, 80, y + 46)
    y += 190
  }

  ctx.fillStyle = '#5B6B70'
  ctx.font = '500 30px Barlow, sans-serif'
  ctx.fillText('Know exactly what to do on the gym floor.', 80, 1290)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}
