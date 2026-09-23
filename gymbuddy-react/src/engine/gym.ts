export interface NearbyGym {
  name: string
  code: string
  distanceM: number
}

/** Deterministic, short, and stable for the same gym across devices/sessions
 *  (so two people at the same gym end up sharing busy-data under the same
 *  code) — a djb2 hash of the name plus coordinates rounded to ~100m, never
 *  the raw coordinates themselves (nothing that hashes back to an exact
 *  location is stored anywhere). */
export function gymCodeFor(name: string, lat: number, lon: number): string {
  const input = `${name.trim().toLowerCase()}|${lat.toFixed(3)}|${lon.toFixed(3)}`
  let hash = 5381
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
  return Math.abs(hash).toString(36)
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Never blocks: resolves `null` on denial, unavailable geolocation, or a
 *  5-second timeout, instead of rejecting — callers fall straight through
 *  to manual entry with no error state to render. */
export function getLocationOnce(timeoutMs = 5000): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(null)
      }
    }, timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(null)
      },
      { timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}

/** OpenStreetMap Overpass API — free, no key. Coordinates are sent to
 *  Overpass to run the query and never anywhere else; nothing from this
 *  call is stored except the gym's name/code (see gymCodeFor). Resolves to
 *  [] on any failure (rate limit, network, timeout) rather than throwing —
 *  callers show "None of these worked, enter your gym" either way. */
export async function fetchNearbyGyms(lat: number, lon: number, radiusM = 3000): Promise<NearbyGym[]> {
  const query = `[out:json][timeout:8];node["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});out body 20;`
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return []
    const data = (await res.json()) as { elements?: { lat: number; lon: number; tags?: { name?: string } }[] }
    const elements = data.elements ?? []
    return elements
      .filter((el) => el.tags?.name)
      .map((el) => ({
        name: el.tags!.name!,
        code: gymCodeFor(el.tags!.name!, el.lat, el.lon),
        distanceM: haversineMeters(lat, lon, el.lat, el.lon),
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 5)
  } catch {
    return []
  }
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 50) * 50}m`
  return `${(m / 1000).toFixed(1)}km`
}
