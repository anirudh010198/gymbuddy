import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchNearbyGyms, formatDistance, getLocationOnce, gymCodeFor } from './gym'

describe('gymCodeFor', () => {
  it('is deterministic for the same name and coordinates', () => {
    expect(gymCodeFor('PureGym Camden', 51.539, -0.142)).toBe(gymCodeFor('PureGym Camden', 51.539, -0.142))
  })

  it('differs for different names or locations', () => {
    expect(gymCodeFor('PureGym Camden', 51.539, -0.142)).not.toBe(gymCodeFor('PureGym Angel', 51.539, -0.142))
    expect(gymCodeFor('PureGym Camden', 51.539, -0.142)).not.toBe(gymCodeFor('PureGym Camden', 52.0, -0.142))
  })

  it('is case/whitespace-insensitive on the name', () => {
    expect(gymCodeFor('PureGym Camden', 0, 0)).toBe(gymCodeFor('  puregym camden  ', 0, 0))
  })
})

describe('getLocationOnce', () => {
  const originalGeolocation = navigator.geolocation

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', { value: originalGeolocation, configurable: true })
    vi.useRealTimers()
  })

  it('resolves the coordinates on success', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition)
        },
      },
    })
    await expect(getLocationOnce()).resolves.toEqual({ lat: 1, lon: 2 })
  })

  it('resolves null (never rejects) on denial', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1, message: 'denied' } as GeolocationPositionError)
        },
      },
    })
    await expect(getLocationOnce()).resolves.toBeNull()
  })

  it('resolves null when geolocation is unavailable, with no crash', async () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true })
    await expect(getLocationOnce()).resolves.toBeNull()
  })

  it('resolves null after its own timeout if the browser never calls back', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: () => {} }, // never calls success or error
    })
    const promise = getLocationOnce(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await expect(promise).resolves.toBeNull()
  })
})

describe('fetchNearbyGyms', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves [] (never throws) when the request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    await expect(fetchNearbyGyms(0, 0)).resolves.toEqual([])
  })

  it('resolves [] when the response is not ok (e.g. rate-limited)', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    await expect(fetchNearbyGyms(0, 0)).resolves.toEqual([])
  })

  it('maps, sorts by distance, and caps at 5 results', async () => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      lat: i * 0.001,
      lon: 0,
      tags: { name: `Gym ${i}` },
    })).reverse() // farthest first, to prove sorting happens
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ elements }) } as Response)
    const results = await fetchNearbyGyms(0, 0)
    expect(results).toHaveLength(5)
    expect(results[0].name).toBe('Gym 0') // nearest first after sorting
    expect(results.every((g, i) => i === 0 || g.distanceM >= results[i - 1].distanceM)).toBe(true)
  })
})

describe('formatDistance', () => {
  it('rounds sub-km distances to the nearest 50m', () => {
    expect(formatDistance(430)).toBe('450m')
  })
  it('formats km distances to 1 decimal place', () => {
    expect(formatDistance(1834)).toBe('1.8km')
  })
})
