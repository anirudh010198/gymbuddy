// One-off generator: plate-logo SVG -> PNG icon set. Re-run with `node scripts/generate-icons.mjs`
// any time the mark changes. `sharp` is a devDependency only — nothing here ships in the app bundle.
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const RUBBER = '#1E2B30'
const PLATE = '#F2C230'

// "any" purpose: plate ring fills most of the canvas, edge to edge background.
const anySvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${RUBBER}"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="${PLATE}" stroke-width="56"/>
  <circle cx="256" cy="256" r="70" fill="none" stroke="${PLATE}" stroke-width="56"/>
</svg>`

// "maskable" purpose: content kept inside the ~80% safe-zone circle (radius <= 204.8 of 512),
// since Android may crop to a circle/squircle/rounded-square mask.
const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${RUBBER}"/>
  <circle cx="256" cy="256" r="140" fill="none" stroke="${PLATE}" stroke-width="40"/>
  <circle cx="256" cy="256" r="48" fill="none" stroke="${PLATE}" stroke-width="40"/>
</svg>`

const favicon = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="13" fill="none" stroke="${PLATE}" stroke-width="4.5"/>
  <circle cx="16" cy="16" r="4.5" fill="none" stroke="${PLATE}" stroke-width="4.5"/>
</svg>`

async function render(svg, size, filename) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(outDir, filename))
  console.log('wrote', filename)
}

await render(anySvg, 192, 'icon-192.png')
await render(anySvg, 512, 'icon-512.png')
await render(anySvg, 180, 'apple-touch-icon.png')
await render(maskableSvg, 192, 'icon-maskable-192.png')
await render(maskableSvg, 512, 'icon-maskable-512.png')

writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), favicon)
console.log('wrote favicon.svg')
