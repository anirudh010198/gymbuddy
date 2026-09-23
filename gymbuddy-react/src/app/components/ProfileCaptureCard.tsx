import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PrimaryButton, GhostButton } from './ui'
import { saveContactProfile, dismissProfileCapture } from '../lib/contactProfile'

const inputClass = 'mt-1 w-full rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate'

export default function ProfileCaptureCard({ defaultAge, onDone }: { defaultAge?: number | null; onDone: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState(defaultAge != null ? String(defaultAge) : '')
  const [method, setMethod] = useState<'phone' | 'email'>('email')
  const [contactValue, setContactValue] = useState('')
  // Must start unticked — a pre-checked consent box isn't meaningful consent.
  const [consent, setConsent] = useState(false)

  function skip() {
    dismissProfileCapture()
    onDone()
  }

  function submit() {
    if (!consent) return
    saveContactProfile({
      firstName: firstName.trim(),
      age: age.trim() === '' ? null : Number(age),
      contactMethod: method,
      contactValue: contactValue.trim(),
    })
    dismissProfileCapture()
    onDone()
  }

  const canSubmit = consent && firstName.trim() !== '' && contactValue.trim() !== ''

  return (
    <Card className="mt-4 p-4">
      <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
        Want your progress saved and a reminder on your gym days?
      </div>
      <p className="mt-1 text-sm text-muted">Totally optional — skip any time, nothing here blocks the app.</p>
      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="text-sm font-semibold">First name</span>
          <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Age (optional)</span>
          <input type="number" min={13} max={100} className={`${inputClass} w-24`} value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <div>
          <span className="text-sm font-semibold">Contact</span>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              aria-pressed={method === 'email'}
              onClick={() => setMethod('email')}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${method === 'email' ? 'border-plate bg-plate/10' : 'border-line'}`}
            >
              Email
            </button>
            <button
              type="button"
              aria-pressed={method === 'phone'}
              onClick={() => setMethod('phone')}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${method === 'phone' ? 'border-plate bg-plate/10' : 'border-line'}`}
            >
              Phone
            </button>
          </div>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            className={inputClass}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={method === 'email' ? 'you@example.com' : '+91 ...'}
            aria-label={method === 'email' ? 'Email address' : 'Phone number'}
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I agree to GymBuddy storing these details to save my progress and send workout reminders.</span>
        </label>
        <p className="text-xs text-muted">
          <Link to="/privacy" className="underline decoration-line underline-offset-2">
            Read our privacy page
          </Link>{' '}
          — what's stored, why, and how to have it deleted.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <GhostButton onClick={skip}>Skip</GhostButton>
          <PrimaryButton disabled={!canSubmit} onClick={submit}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </Card>
  )
}
