import { useState } from 'react'
import { useTeamStore } from '../store/useTeamStore'
import { INTERVIEW_QUESTIONS, VENUES, type Interview } from '../types'
import { Card, PrimaryButton, Wrap } from '../../app/components/ui'
import { Field, TextArea, TextInput, Select } from '../components/form'

type Draft = Omit<Interview, 'id' | 'at'>

const EMPTY_DRAFT: Draft = {
  name: '',
  age: '',
  venue: VENUES[0],
  months: '',
  routine: '',
  choose: '',
  problems: '',
  apps: '',
  consistency: '',
  wouldUse: '',
  obs: '',
  frus: '',
  quote: '',
  consent: false,
}

function toMarkdownTable(interviews: Interview[]): string {
  const esc = (s: string) => s.replace(/\|/g, '/')
  const header = '| Participant | Venue | Current routine | Key observation | Main frustration |\n|---|---|---|---|---|'
  const rows = interviews.map(
    (i) => `| ${esc(i.name)}${i.age ? ', ' + esc(i.age) : ''} | ${esc(i.venue)} | ${esc(i.routine)} | ${esc(i.obs)} | ${esc(i.frus)} |`,
  )
  return [header, ...rows].join('\n')
}

export default function Interviews() {
  const interviews = useTeamStore((s) => s.interviews)
  const addInterview = useTeamStore((s) => s.addInterview)
  const deleteInterview = useTeamStore((s) => s.deleteInterview)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const byVenue = VENUES.map((v) => [v, interviews.filter((i) => i.venue === v).length] as const)

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function save() {
    if (!draft.name.trim()) return
    addInterview(draft)
    setDraft(EMPTY_DRAFT)
  }

  return (
    <Wrap wide>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
            Interviews
          </h1>
          <p className="mt-1 text-muted">Log each conversation right after it ends, while quotes are fresh.</p>
        </div>
        <Card className="px-4 py-3">
          <span className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
            {interviews.length}
          </span>
          <span className="text-muted"> of 5 minimum</span>
          <div className="text-sm text-muted">{byVenue.map(([v, n]) => `${v}: ${n}`).join(', ')}</div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card className="grid gap-3 p-5">
          <h2 className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
            New interview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <TextInput value={draft.name} onChange={(e) => patch({ name: e.target.value })} required />
            </Field>
            <Field label="Age">
              <TextInput value={draft.age} onChange={(e) => patch({ age: e.target.value })} inputMode="numeric" />
            </Field>
            <Field label="Where they train">
              <Select value={draft.venue} onChange={(e) => patch({ venue: e.target.value })}>
                {VENUES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
            </Field>
            <Field label="Months training">
              <TextInput value={draft.months} onChange={(e) => patch({ months: e.target.value })} inputMode="numeric" />
            </Field>
          </div>
          {INTERVIEW_QUESTIONS.map(([key, question, probe]) => (
            <Field key={key} label={question} hint={`Probe: ${probe}`}>
              <TextArea rows={2} value={draft[key as keyof Draft] as string} onChange={(e) => patch({ [key]: e.target.value } as Partial<Draft>)} />
            </Field>
          ))}
          <Field label="Key observation (what you saw, not what they said)">
            <TextArea rows={2} value={draft.obs} onChange={(e) => patch({ obs: e.target.value })} />
          </Field>
          <Field label="Main frustration, in one line">
            <TextInput value={draft.frus} onChange={(e) => patch({ frus: e.target.value })} />
          </Field>
          <Field label="Best verbatim quote">
            <TextArea rows={2} value={draft.quote} onChange={(e) => patch({ quote: e.target.value })} />
          </Field>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.consent} onChange={(e) => patch({ consent: e.target.checked })} />
            They agreed to be quoted (first name only)
          </label>
          <PrimaryButton onClick={save}>Save interview</PrimaryButton>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
            Interview matrix
          </h2>
          {interviews.length ? (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="border-b border-line py-2 pr-2">Participant</th>
                      <th className="border-b border-line py-2 pr-2">Venue</th>
                      <th className="border-b border-line py-2 pr-2">Routine</th>
                      <th className="border-b border-line py-2 pr-2">Observation</th>
                      <th className="border-b border-line py-2 pr-2">Frustration</th>
                      <th className="border-b border-line py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((i) => (
                      <tr key={i.id}>
                        <td className="border-b border-line py-2 pr-2 align-top">
                          <b>{i.name}</b>
                          {i.age ? `, ${i.age}` : ''}
                          <div className="text-xs text-muted">{i.months || '?'} mo</div>
                        </td>
                        <td className="border-b border-line py-2 pr-2 align-top">{i.venue}</td>
                        <td className="border-b border-line py-2 pr-2 align-top">{i.routine}</td>
                        <td className="border-b border-line py-2 pr-2 align-top">{i.obs}</td>
                        <td className="border-b border-line py-2 pr-2 align-top">{i.frus}</td>
                        <td className="border-b border-line py-2 align-top">
                          <button type="button" className="text-xs text-muted underline" onClick={() => deleteInterview(i.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="mt-5 font-display font-bold" style={{ fontSize: '1.15rem' }}>
                Quote wall
              </h3>
              {interviews.filter((i) => i.quote && i.consent).length ? (
                interviews
                  .filter((i) => i.quote && i.consent)
                  .map((i) => (
                    <blockquote key={i.id} className="mt-2 border-l-4 border-plate pl-3">
                      "{i.quote}"
                      <div className="text-sm text-muted">
                        {i.name}, {i.venue}
                      </div>
                    </blockquote>
                  ))
              ) : (
                <p className="text-sm text-muted">Quotes appear here once participants agree to be quoted.</p>
              )}

              <h3 className="mt-5 font-display font-bold" style={{ fontSize: '1.15rem' }}>
                Copy for your submission
              </h3>
              <TextArea className="mt-1 text-xs" rows={6} readOnly value={toMarkdownTable(interviews)} />
            </>
          ) : (
            <p className="mt-2 text-muted">No interviews yet. Aim for at least 2 venues so your insights aren't one gym's quirks.</p>
          )}
        </Card>
      </div>
    </Wrap>
  )
}
