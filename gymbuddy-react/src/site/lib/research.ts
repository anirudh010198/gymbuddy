import raw from '../../content/research.json'

export interface ResearchInterview {
  name: string
  age: string
  venue: string
  routine: string
  observation: string
  frustration: string
  quote: string
  consent: boolean
}

export interface ResearchInsight {
  title: string
  evidence: string
  implication: string
}

export interface ResearchData {
  interviews: ResearchInterview[]
  insights: ResearchInsight[]
  killedHypothesis: string
  funnel: { approached: number | null; tried: number | null; completed: number | null; wouldReuse: number | null; returned: number | null }
  metrics: { week1Repeat: number | null; swapConversion: number | null; setCompletion: number | null; sampleSize: number | null }
  iteration: { saw: string; assumed: string; changed: string; result: string }
}

/** The team fills src/content/research.json in via /team's "Export research.json"
 *  button. Every consumer must handle every field being empty/null gracefully —
 *  never invent placeholder numbers or quotes. */
export const research = raw as ResearchData

export const consentedQuotes = research.interviews.filter((i) => i.consent && i.quote)
