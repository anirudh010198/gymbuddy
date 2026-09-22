export const VENUES = ['Budget gym', 'Cult.fit', 'Society gym', 'Other'] as const

/** [field key, question, follow-up probe] — ported from js/app.js's Q array. */
export const INTERVIEW_QUESTIONS = [
  ['routine', 'What does your current gym routine look like?', 'Walk me through your last session, start to finish.'],
  ['choose', 'How do you decide what exercises to do?', 'Where did that come from? YouTube, a friend, the trainer?'],
  ['problems', 'What problems do you face while working out?', 'Tell me about the last time you felt stuck on the floor.'],
  ['apps', 'Have you used any fitness apps? What happened?', 'Why did you stop?'],
  ['consistency', 'What makes it hard to stay consistent?', 'When did you last skip, and what happened that day?'],
  ['wouldUse', 'What would make you use a product regularly?', "If it did only one thing for you, what should it be?"],
] as const

export interface Interview {
  id: string
  name: string
  age: string
  venue: string
  months: string
  routine: string
  choose: string
  problems: string
  apps: string
  consistency: string
  wouldUse: string
  obs: string
  frus: string
  quote: string
  consent: boolean
  at: number
}

export const FUNNEL_STAGES = [
  ['tried', "Tried the product"],
  ['core', 'Completed a workout'],
  ['reuse', "Said they'd use it again"],
  ['returned', 'Came back next day'],
  ['w1', '2+ workouts in week 1'],
  ['swapped', 'Used Swap'],
] as const

export type FunnelStageKey = (typeof FUNNEL_STAGES)[number][0]

export interface Tester {
  id: string
  name: string
  venue: string
  at: number
  tried: boolean
  core: boolean
  reuse: boolean
  returned: boolean
  w1: boolean
  swapped: boolean
  note: string
}

export interface Insight {
  title: string
  evidence: string
  implication: string
}

export interface Iteration {
  saw: string
  assumed: string
  changed: string
  result: string
}

export interface Synthesis {
  insights: Insight[]
  killedHypothesis: string
  iteration: Iteration
}

export const EMPTY_SYNTHESIS: Synthesis = {
  insights: [
    { title: '', evidence: '', implication: '' },
    { title: '', evidence: '', implication: '' },
    { title: '', evidence: '', implication: '' },
  ],
  killedHypothesis: '',
  iteration: { saw: '', assumed: '', changed: '', result: '' },
}

/** AI-generated draft (api/synthesize), kept separate from the manually
 *  authored Synthesis fields above — a suggestion the team reviews and
 *  copies in by hand, never auto-published. */
export interface AiSynthesisDraft {
  insights: Insight[]
  persona: { goal: string; behaviour: string; frustration: string } | null
  problem: string | null
  generatedAt: number
  interviewCount: number
}
