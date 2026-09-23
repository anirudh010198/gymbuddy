import { useState } from 'react'
import Sheet from './Sheet'
import { Chip, PrimaryButton, GhostButton } from './ui'
import { fetchNearbyGyms, formatDistance, getLocationOnce, gymCodeFor, type NearbyGym } from '../../engine/gym'

type Step = 'start' | 'searching' | 'results' | 'manual'

/** Never blocks the workout — this is always reachable from a link, never a
 *  popup that appears on its own. Geolocation denial/timeout/unavailability
 *  all fall through to the same manual-entry step, no error screen. */
export default function FindGymSheet({
  open,
  onPick,
  onClose,
}: {
  open: boolean
  onPick: (name: string, code: string, method: 'geo' | 'manual') => void
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('start')
  const [results, setResults] = useState<NearbyGym[]>([])
  const [manualName, setManualName] = useState('')
  const [showPrivacyNote, setShowPrivacyNote] = useState(false)

  function reset() {
    setStep('start')
    setResults([])
    setManualName('')
    setShowPrivacyNote(false)
  }

  function handleClose() {
    onClose()
    window.setTimeout(reset, 200)
  }

  async function handleUseLocation() {
    setStep('searching')
    const loc = await getLocationOnce(5000)
    if (!loc) {
      setStep('manual') // denied, unavailable, or timed out — no error, just the fallback
      return
    }
    const nearby = await fetchNearbyGyms(loc.lat, loc.lon)
    if (!nearby.length) {
      setStep('manual')
      return
    }
    setResults(nearby)
    setStep('results')
  }

  function submitManual() {
    const name = manualName.trim()
    if (!name) return
    onPick(name, gymCodeFor(name, 0, 0), 'manual')
    handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose}>
      <h2 className="font-display font-bold" style={{ fontSize: '1.6rem' }}>
        Find my gym
      </h2>

      {step === 'start' && (
        <>
          <p className="mb-4 text-muted">
            We'll ask your phone for your location once, just to find gyms nearby.{' '}
            <button
              type="button"
              className="underline decoration-line underline-offset-2"
              onClick={() => setShowPrivacyNote((v) => !v)}
            >
              Why?
            </button>
          </p>
          {showPrivacyNote && (
            <p className="mb-4 rounded-xl bg-soft p-3 text-sm">
              Used once to find gyms near you. Your location is never stored or shared.
            </p>
          )}
          <div className="grid gap-3">
            <PrimaryButton onClick={handleUseLocation}>Use my location</PrimaryButton>
            <GhostButton onClick={() => setStep('manual')}>Enter my gym's name instead</GhostButton>
          </div>
        </>
      )}

      {step === 'searching' && (
        <div role="status" aria-label="Loading nearby gyms" className="mt-4 grid gap-3">
          <p className="text-muted">Looking for gyms nearby…</p>
          {[0, 1, 2].map((key) => (
            <div key={key} aria-hidden="true" className="h-14 animate-pulse rounded-2xl border border-line bg-soft" />
          ))}
        </div>
      )}

      {step === 'results' && (
        <>
          <p className="mb-3 text-muted">Which one is it?</p>
          <div className="grid gap-2">
            {results.map((g) => (
              <Chip
                key={g.code}
                onClick={() => {
                  onPick(g.name, g.code, 'geo')
                  handleClose()
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{g.name}</span>
                  <span className="shrink-0 text-sm text-muted">{formatDistance(g.distanceM)}</span>
                </div>
              </Chip>
            ))}
            <GhostButton onClick={() => setStep('manual')}>None of these</GhostButton>
          </div>
        </>
      )}

      {step === 'manual' && (
        <>
          <p className="mb-3 text-muted">What's your gym called?</p>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
            placeholder="e.g. PureGym Camden"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            aria-label="Gym name"
            autoFocus
          />
          <PrimaryButton className="mt-4" disabled={!manualName.trim()} onClick={submitManual}>
            Save
          </PrimaryButton>
        </>
      )}
    </Sheet>
  )
}
