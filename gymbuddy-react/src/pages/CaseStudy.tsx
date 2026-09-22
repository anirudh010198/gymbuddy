import type { ReactNode } from 'react'
import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'
import FunnelChart from '../site/components/FunnelChart'
import { research, consentedQuotes } from '../site/lib/research'
import { V1_SCOPE, V2_SCOPE, CUT_SCOPE, DECISIONS, STACK, BROKE_FIXED, ROADMAP } from '../content/casestudy'

const TOC = [
  ['problem', 'The problem'],
  ['research', 'Research'],
  ['decisions', 'Decisions'],
  ['build', 'Build'],
  ['testing', 'Testing'],
  ['metrics', 'Metrics'],
  ['next', "What's next"],
] as const

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-line py-12 first:pt-0 last:border-b-0">
      <h2 className="font-display font-extrabold" style={{ fontSize: '2rem' }}>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-card border border-line bg-card p-5 text-muted">{children}</p>
}

function pct(v: number | null): string {
  return v == null ? '–' : `${v}%`
}

export default function CaseStudy() {
  const { interviews, insights, killedHypothesis, funnel, metrics, iteration } = research

  const funnelRows = [
    { label: 'People approached', value: funnel.approached, base: funnel.approached },
    { label: 'Tried the product', value: funnel.tried, base: funnel.approached },
    { label: 'Completed a workout', value: funnel.completed, base: funnel.tried },
    { label: "Said they'd use it again", value: funnel.wouldReuse, base: funnel.completed },
    { label: 'Came back next day', value: funnel.returned, base: funnel.completed },
  ]
  const hasFunnelData = funnel.approached != null

  const hasIteration = iteration.saw || iteration.assumed || iteration.changed || iteration.result

  return (
    <div className="bg-bg text-ink">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6">
        <div className="border-b border-line py-10 print:py-4">
          <h1 className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.4rem)' }}>
            Case study
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Research → decisions → build → testing → metrics. How GymBuddy V1 got built, honestly — including what we don't
            know yet.
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl border-2 border-line px-4 py-2 text-sm font-semibold print:hidden"
            onClick={() => window.print()}
          >
            Download as PDF
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-6 grid gap-1 print:hidden">
              {TOC.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-muted hover:bg-card hover:text-ink">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <Section id="problem" title="The problem">
              <p className="max-w-2xl">
                <b>The hypothesis going in:</b> beginners quit in their first 90 days because every session starts with not
                knowing what to do, and ends early when a planned machine is busy.
              </p>
              <div className="mt-5">
                {interviews.length > 0 ? (
                  <p className="text-muted">Persona synthesis pending — add it to Synthesis in /team once interviews are logged.</p>
                ) : (
                  <Empty>Persona in progress — no interviews logged yet. Log them at /team.</Empty>
                )}
              </div>
            </Section>

            <Section id="research" title="Research">
              {interviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="border-b border-line py-2 pr-2">Participant</th>
                        <th className="border-b border-line py-2 pr-2">Venue</th>
                        <th className="border-b border-line py-2 pr-2">Routine</th>
                        <th className="border-b border-line py-2 pr-2">Observation</th>
                        <th className="border-b border-line py-2">Frustration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((i, ix) => (
                        <tr key={ix}>
                          <td className="border-b border-line py-2 pr-2 align-top">
                            <b>{i.name}</b>
                            {i.age ? `, ${i.age}` : ''}
                          </td>
                          <td className="border-b border-line py-2 pr-2 align-top">{i.venue}</td>
                          <td className="border-b border-line py-2 pr-2 align-top">{i.routine}</td>
                          <td className="border-b border-line py-2 pr-2 align-top">{i.observation}</td>
                          <td className="border-b border-line py-2 align-top">{i.frustration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No interviews logged yet — the matrix will appear here once the team runs them.</Empty>
              )}

              <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                Insights
              </h3>
              {insights.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {insights.map((ins, i) => (
                    <div key={i} className="rounded-card border border-line bg-card p-4">
                      <div className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                        {ins.title}
                      </div>
                      <p className="mt-2 text-sm text-muted">{ins.evidence}</p>
                      <p className="mt-2 text-sm">{ins.implication}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>Insights in progress — write these up in /team → Synthesis once there's enough data.</Empty>
              )}

              {consentedQuotes.length > 0 && (
                <>
                  <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                    In their words
                  </h3>
                  <div className="grid gap-3">
                    {consentedQuotes.map((q, i) => (
                      <blockquote key={i} className="border-l-4 border-plate pl-3">
                        "{q.quote}"
                        <div className="text-sm text-muted">
                          {q.name}, {q.venue}
                        </div>
                      </blockquote>
                    ))}
                  </div>
                </>
              )}

              <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                A hypothesis the research killed
              </h3>
              {killedHypothesis ? <p>{killedHypothesis}</p> : <Empty>Not written up yet.</Empty>}
            </Section>

            <Section id="decisions" title="Decisions">
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <h3 className="font-display font-bold text-go">V1</h3>
                  <ul className="mt-2 grid gap-1.5 text-sm">
                    {V1_SCOPE.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display font-bold text-muted">V2</h3>
                  <ul className="mt-2 grid gap-1.5 text-sm text-muted">
                    {V2_SCOPE.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display font-bold text-warn">Cut</h3>
                  <ul className="mt-2 grid gap-1.5 text-sm text-muted">
                    {CUT_SCOPE.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                3 key decisions
              </h3>
              <div className="grid gap-4">
                {DECISIONS.map((d, i) => (
                  <div key={i} className="rounded-card border border-line bg-card p-4">
                    <div className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                      {d.title}
                    </div>
                    <p className="mt-2 text-sm text-muted">{d.tradeoff}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="build" title="Build">
              <div className="flex flex-wrap gap-2">
                {STACK.map((s, i) => (
                  <span key={i} className="rounded-full bg-soft px-3 py-1 text-sm font-semibold text-muted">
                    {s}
                  </span>
                ))}
              </div>
              <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                What broke → how we fixed it
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="border-b border-line py-2 pr-4">Broke</th>
                      <th className="border-b border-line py-2">Fixed by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BROKE_FIXED.map((row, i) => (
                      <tr key={i}>
                        <td className="border-b border-line py-2 pr-4 align-top">{row.broke}</td>
                        <td className="border-b border-line py-2 align-top">{row.fixed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="testing" title="Testing">
              {hasFunnelData ? <FunnelChart rows={funnelRows} /> : <Empty>No test funnel data yet — track it at /team → Test funnel.</Empty>}

              <h3 className="mb-3 mt-8 font-display font-bold" style={{ fontSize: '1.3rem' }}>
                One iteration: before / after
              </h3>
              {hasIteration ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-muted">We saw</div>
                    <p>{iteration.saw || '—'}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-muted">We assumed</div>
                    <p>{iteration.assumed || '—'}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-muted">We changed</div>
                    <p>{iteration.changed || '—'}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-muted">What happened after</div>
                    <p>{iteration.result || '—'}</p>
                  </div>
                </div>
              ) : (
                <Empty>No iteration written up yet.</Empty>
              )}
            </Section>

            <Section id="metrics" title="Metrics">
              <div className="rounded-card border border-line bg-card p-6">
                <div className="font-display font-extrabold text-plate" style={{ fontSize: '3rem' }}>
                  {pct(metrics.week1Repeat)}
                </div>
                <div className="text-muted">did 2+ workouts in week 1 (primary metric)</div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-line bg-card p-4">
                  <div className="font-display font-extrabold" style={{ fontSize: '1.6rem' }}>
                    {pct(metrics.swapConversion)}
                  </div>
                  <div className="text-sm text-muted">used Swap</div>
                </div>
                <div className="rounded-card border border-line bg-card p-4">
                  <div className="font-display font-extrabold" style={{ fontSize: '1.6rem' }}>
                    {pct(metrics.setCompletion)}
                  </div>
                  <div className="text-sm text-muted">set completion rate</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {metrics.sampleSize != null ? `Based on ${metrics.sampleSize} tester${metrics.sampleSize === 1 ? '' : 's'}.` : 'No sample yet — these numbers are not measured.'}
              </p>
            </Section>

            <Section id="next" title="What's next">
              <div className="grid gap-4">
                {ROADMAP.map((r, i) => (
                  <div key={i} className="rounded-card border border-line bg-card p-4">
                    <div className="font-display font-bold" style={{ fontSize: '1.1rem' }}>
                      {r.title}
                    </div>
                    <p className="mt-2 text-sm text-muted">{r.reason}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  )
}
