import type { Interview, Synthesis, Tester } from '../types'

export interface ResearchJson {
  interviews: { name: string; age: string; venue: string; routine: string; observation: string; frustration: string; quote: string; consent: boolean }[]
  insights: { title: string; evidence: string; implication: string }[]
  killedHypothesis: string
  funnel: { approached: number | null; tried: number | null; completed: number | null; wouldReuse: number | null; returned: number | null }
  metrics: { week1Repeat: number | null; swapConversion: number | null; setCompletion: number | null; sampleSize: number | null }
  iteration: { saw: string; assumed: string; changed: string; result: string }
}

function pct(a: number, b: number): number | null {
  return b ? Math.round((a / b) * 100) : null
}

/** The exact shape CLAUDE.md section 8 specifies for src/content/research.json —
 *  what the landing page and case study read. Quotes are only included when the
 *  participant consented; insights/killedHypothesis/iteration come from the
 *  team-authored Synthesis tab (no AI — this app has no backend to call one from). */
export function buildResearchJson(interviews: Interview[], testers: Tester[], synthesis: Synthesis): ResearchJson {
  const n = testers.length
  const count = (key: keyof Tester) => testers.filter((t) => t[key]).length
  const core = count('core')

  return {
    interviews: interviews.map((i) => ({
      name: i.name,
      age: i.age,
      venue: i.venue,
      routine: i.routine,
      observation: i.obs,
      frustration: i.frus,
      quote: i.consent ? i.quote : '',
      consent: i.consent,
    })),
    insights: synthesis.insights.filter((ins) => ins.title || ins.evidence || ins.implication),
    killedHypothesis: synthesis.killedHypothesis,
    funnel: {
      approached: n || null,
      tried: n ? count('tried') : null,
      completed: n ? core : null,
      wouldReuse: n ? count('reuse') : null,
      returned: n ? count('returned') : null,
    },
    metrics: {
      week1Repeat: pct(count('w1'), core),
      swapConversion: pct(count('swapped'), core),
      setCompletion: null, // not tracked by this console — the team fills this in from product analytics
      sampleSize: n || null,
    },
    iteration: synthesis.iteration,
  }
}

export interface TeamBackup {
  exportedAt: string
  interviews: Interview[]
  testers: Tester[]
  synthesis: Synthesis
}

export function buildBackup(interviews: Interview[], testers: Tester[], synthesis: Synthesis): TeamBackup {
  return { exportedAt: new Date().toISOString(), interviews, testers, synthesis }
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function downloadResearchJson(interviews: Interview[], testers: Tester[], synthesis: Synthesis) {
  downloadJson(buildResearchJson(interviews, testers, synthesis), 'research.json')
}

export function downloadBackup(interviews: Interview[], testers: Tester[], synthesis: Synthesis) {
  const today = new Date().toISOString().slice(0, 10)
  downloadJson(buildBackup(interviews, testers, synthesis), `gymbuddy-team-backup-${today}.json`)
}

/** Best-effort validation of an uploaded backup file — rejects anything that
 *  doesn't at least look like {interviews: [], testers: []}. */
export function parseBackup(text: string): Partial<TeamBackup> | null {
  try {
    const data = JSON.parse(text)
    if (!data || typeof data !== 'object') return null
    if (data.interviews != null && !Array.isArray(data.interviews)) return null
    if (data.testers != null && !Array.isArray(data.testers)) return null
    return data as Partial<TeamBackup>
  } catch {
    return null
  }
}
