import { useState } from 'react'
import { useTeamStore } from '../store/useTeamStore'
import { FUNNEL_STAGES } from '../types'
import { Card, PrimaryButton, Wrap } from '../../app/components/ui'
import { Field, TextArea, TextInput } from '../components/form'

function pct(a: number, b: number): string {
  return b ? `${Math.round((a / b) * 100)}%` : '–'
}

export default function Funnel() {
  const testers = useTeamStore((s) => s.testers)
  const addTester = useTeamStore((s) => s.addTester)
  const setTesterStage = useTeamStore((s) => s.setTesterStage)
  const setTesterNote = useTeamStore((s) => s.setTesterNote)
  const [name, setName] = useState('')
  const [venue, setVenue] = useState('')

  const n = testers.length
  const count = (key: (typeof FUNNEL_STAGES)[number][0]) => testers.filter((t) => t[key]).length
  const tried = count('tried')
  const core = count('core')
  const reuse = count('reuse')
  const returned = count('returned')
  const w1 = count('w1')
  const swapped = count('swapped')

  const rows: [string, number, number][] = [
    ['People approached', n, n],
    ['Tried the product', tried, n],
    ['Completed core action', core, tried],
    ["Said they'd use it again", reuse, core],
    ['Actually came back', returned, core],
  ]

  function add() {
    if (!name.trim()) return
    addTester(name.trim(), venue.trim())
    setName('')
    setVenue('')
  }

  const markdown =
    '| Metric | Number |\n|---|---|\n' +
    rows.map(([l, v]) => `| ${l} | ${v} |`).join('\n') +
    `\n| 2+ workouts in week 1 | ${w1} (${pct(w1, core)}) |`

  return (
    <Wrap wide>
      <h1 className="mt-2 font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
        Test funnel
      </h1>
      <p className="mt-1 text-muted">
        Add everyone you approach, including people who say no. Tick stages as they happen; the numbers below are your
        submission table.
      </p>

      <div className="mt-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card className="p-5">
          {rows.map(([label, value, base]) => (
            <div key={label} className="mt-3">
              <div className="flex justify-between">
                <b>{label}</b>
                <span>
                  <b className="font-display" style={{ fontSize: '1.3rem' }}>
                    {value}
                  </b>{' '}
                  <span className="text-sm text-muted">{label === 'People approached' ? '' : `${pct(value, base)} of prev.`}</span>
                </span>
              </div>
              <div className="mt-1 h-[10px] overflow-hidden rounded-full bg-soft">
                <div className="h-full bg-plate" style={{ width: `${n ? (value / n) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
                {pct(w1, core)}
              </div>
              <div className="text-sm text-muted">Primary: 2+ workouts in week 1 (of activated)</div>
            </Card>
            <Card className="p-3">
              <div className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
                {pct(swapped, core)}
              </div>
              <div className="text-sm text-muted">Supporting: used Swap (of activated)</div>
            </Card>
          </div>
          <h3 className="mt-5 font-display font-bold" style={{ fontSize: '1.15rem' }}>
            Copy for your submission
          </h3>
          <TextArea className="mt-1 text-xs" rows={7} readOnly value={markdown} />
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
            Add a person
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="Name or nickname">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Where">
              <TextInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Cult.fit Sector 17" />
            </Field>
          </div>
          <PrimaryButton className="mt-3" onClick={add}>
            Add to funnel
          </PrimaryButton>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="border-b border-line py-2 pr-2">Person</th>
                  {FUNNEL_STAGES.map(([key, label]) => (
                    <th key={key} className="border-b border-line py-2 pr-2">
                      {label}
                    </th>
                  ))}
                  <th className="border-b border-line py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((t) => (
                  <tr key={t.id}>
                    <td className="border-b border-line py-2 pr-2 align-top">
                      <b>{t.name}</b>
                      <div className="text-xs text-muted">{t.venue}</div>
                    </td>
                    {FUNNEL_STAGES.map(([key, label]) => (
                      <td key={key} className="border-b border-line py-2 pr-2 align-top">
                        <input
                          type="checkbox"
                          aria-label={`${t.name} — ${label}`}
                          checked={t[key]}
                          onChange={(e) => setTesterStage(t.id, key, e.target.checked)}
                        />
                      </td>
                    ))}
                    <td className="border-b border-line py-2 align-top">
                      <TextInput
                        className="min-w-[160px] p-1.5 text-xs"
                        value={t.note}
                        placeholder="Where they got stuck"
                        onChange={(e) => setTesterNote(t.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Wrap>
  )
}
