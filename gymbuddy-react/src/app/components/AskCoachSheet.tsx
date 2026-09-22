import { useState } from 'react'
import Sheet from './Sheet'
import { PrimaryButton } from './ui'
import { useGym } from '../../store/GymStoreContext'
import { DAILY_LIMIT, canAsk, recordAsk } from '../lib/aiRateLimit'
import type { Exercise, GoalKey } from '../../engine/types'

const FALLBACK_MESSAGE = "Couldn't get an answer right now. The written cues above still apply."

type Status = 'idle' | 'loading' | 'answered' | 'error' | 'limited'

export default function AskCoachSheet({
  open,
  exercise,
  goal,
  onClose,
}: {
  open: boolean
  exercise: Exercise | null
  goal: GoalKey
  onClose: () => void
}) {
  const trackEvent = useGym((s) => s.trackEvent)
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [answer, setAnswer] = useState('')

  function handleClose() {
    onClose()
    window.setTimeout(() => {
      setQuestion('')
      setStatus('idle')
      setAnswer('')
    }, 200)
  }

  async function submit() {
    if (!exercise || !question.trim()) return
    if (!canAsk()) {
      setStatus('limited')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: exercise.id, question: question.trim(), goal }),
      })
      const data = await res.json()
      if (!res.ok || typeof data.answer !== 'string') throw new Error('bad response')
      recordAsk()
      trackEvent('ai_ask', { ex: exercise.id })
      setAnswer(data.answer)
      setStatus('answered')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Sheet open={open} onClose={handleClose}>
      {exercise && (
        <>
          <h2 className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
            Ask GymBuddy about {exercise.name}
          </h2>
          <p className="mt-1 text-sm text-muted">e.g. "What weight should I start with?" or "Should this feel hard?"</p>
          <textarea
            className="mt-3 w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={status === 'loading'}
            placeholder="Type your question…"
          />
          {status === 'limited' && (
            <p className="mt-2 text-sm text-warn">You've asked {DAILY_LIMIT} questions today — more tomorrow.</p>
          )}
          {status === 'error' && <p className="mt-2 text-sm text-warn">{FALLBACK_MESSAGE}</p>}
          {status === 'answered' && <p className="mt-3 rounded-xl bg-plate/10 p-3 text-sm">{answer}</p>}
          <PrimaryButton className="mt-3" onClick={submit} disabled={!question.trim() || status === 'loading'}>
            {status === 'loading' ? 'Asking…' : 'Ask'}
          </PrimaryButton>
        </>
      )}
    </Sheet>
  )
}
