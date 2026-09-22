import { useState } from 'react'
import { useTeamStore } from '../store/useTeamStore'
import { Card, Wrap } from '../../app/components/ui'
import { Field, TextArea } from '../components/form'
import { useAiAvailable } from '../../app/lib/useAiAvailable'
import type { Interview } from '../types'

/** Only interview text — never name/age/months — goes to the model. */
function stripIdentity(i: Interview) {
  return {
    venue: i.venue,
    routine: i.routine,
    choose: i.choose,
    problems: i.problems,
    apps: i.apps,
    consistency: i.consistency,
    wouldUse: i.wouldUse,
    observation: i.obs,
    frustration: i.frus,
    quote: i.consent ? i.quote : undefined,
  }
}

export default function Synthesis() {
  const interviews = useTeamStore((s) => s.interviews)
  const synthesis = useTeamStore((s) => s.synthesis)
  const aiDraft = useTeamStore((s) => s.aiDraft)
  const setAiDraft = useTeamStore((s) => s.setAiDraft)
  const updateInsight = useTeamStore((s) => s.updateInsight)
  const updateKilledHypothesis = useTeamStore((s) => s.updateKilledHypothesis)
  const updateIteration = useTeamStore((s) => s.updateIteration)
  const aiAvailable = useAiAvailable()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function synthesise() {
    setStatus('loading')
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviews: interviews.map(stripIdentity) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(String(res.status))
      setAiDraft({
        insights: Array.isArray(data.insights) ? data.insights : [],
        persona: data.persona ?? null,
        problem: typeof data.problem === 'string' ? data.problem : null,
        generatedAt: Date.now(),
        interviewCount: interviews.length,
      })
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Wrap wide>
      <h1 className="mt-2 font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
        Synthesis
      </h1>
      <p className="mt-1 text-muted">
        Write these up by hand from your interviews and test notes. Whatever you write below goes straight into the exported
        research.json.
      </p>

      {aiAvailable && (
        <Card className="mt-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display font-bold" style={{ fontSize: '1.15rem' }}>
                AI-assisted draft
              </div>
              <p className="text-sm text-muted">
                Reads only interview text (never names or ages) and suggests insights, a persona and a problem statement — a
                draft to review, not something published automatically.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-2xl bg-plate px-4 py-3 font-display font-bold text-plate-ink transition-transform active:scale-[0.98] disabled:opacity-45"
              disabled={interviews.length === 0 || status === 'loading'}
              onClick={synthesise}
            >
              {status === 'loading' ? 'Synthesising…' : `Synthesise ${interviews.length || ''} interview${interviews.length === 1 ? '' : 's'}`}
            </button>
          </div>
          {status === 'error' && <p className="mt-2 text-sm text-warn">Couldn't synthesise right now — try again in a moment.</p>}
          {interviews.length === 0 && <p className="mt-2 text-sm text-muted">Log interviews first.</p>}

          {aiDraft && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4">
              <p className="text-xs text-muted">
                Draft from {aiDraft.interviewCount} interview{aiDraft.interviewCount === 1 ? '' : 's'} — review before copying anything below into your own words.
              </p>
              {aiDraft.problem && (
                <div>
                  <div className="text-sm font-semibold text-muted">Problem statement (draft)</div>
                  <p>{aiDraft.problem}</p>
                </div>
              )}
              {aiDraft.persona && (
                <div>
                  <div className="text-sm font-semibold text-muted">Persona (draft)</div>
                  <p className="text-sm">
                    <b>Goal:</b> {aiDraft.persona.goal}
                  </p>
                  <p className="text-sm">
                    <b>Behaviour:</b> {aiDraft.persona.behaviour}
                  </p>
                  <p className="text-sm">
                    <b>Frustration:</b> {aiDraft.persona.frustration}
                  </p>
                </div>
              )}
              {aiDraft.insights.length > 0 && (
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-muted">Insights (draft)</div>
                  {aiDraft.insights.map((ins, i) => (
                    <div key={i} className="rounded-xl bg-soft p-3 text-sm">
                      <b>{ins.title}</b>
                      <p className="mt-1">{ins.evidence}</p>
                      <p className="mt-1">{ins.implication}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        3 insights
      </h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {synthesis.insights.map((ins, i) => (
          <Card key={i} className="grid gap-3 p-4">
            <Field label={`Insight ${i + 1}`}>
              <input
                className="w-full rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
                value={ins.title}
                onChange={(e) => updateInsight(i, { title: e.target.value })}
                placeholder="Title"
              />
            </Field>
            <Field label="Evidence" hint="Which participants and what they said or did">
              <TextArea rows={2} value={ins.evidence} onChange={(e) => updateInsight(i, { evidence: e.target.value })} />
            </Field>
            <Field label="So what?" hint="What it means for the product">
              <TextArea rows={2} value={ins.implication} onChange={(e) => updateInsight(i, { implication: e.target.value })} />
            </Field>
          </Card>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        A hypothesis the research killed
      </h2>
      <Card className="p-4">
        <TextArea
          rows={3}
          value={synthesis.killedHypothesis}
          onChange={(e) => updateKilledHypothesis(e.target.value)}
          placeholder="What did you believe going in that the interviews or tests disproved?"
        />
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        One iteration: before / after
      </h2>
      <Card className="grid gap-3 p-4">
        <Field label="What we saw">
          <TextArea rows={2} value={synthesis.iteration.saw} onChange={(e) => updateIteration({ saw: e.target.value })} />
        </Field>
        <Field label="What we assumed">
          <TextArea rows={2} value={synthesis.iteration.assumed} onChange={(e) => updateIteration({ assumed: e.target.value })} />
        </Field>
        <Field label="What we changed">
          <TextArea rows={2} value={synthesis.iteration.changed} onChange={(e) => updateIteration({ changed: e.target.value })} />
        </Field>
        <Field label="What happened after">
          <TextArea rows={2} value={synthesis.iteration.result} onChange={(e) => updateIteration({ result: e.target.value })} />
        </Field>
      </Card>
    </Wrap>
  )
}
