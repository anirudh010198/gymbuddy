import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callGemini, isConfigured } from './_gemini'

interface InterviewInput {
  venue?: string
  routine?: string
  choose?: string
  problems?: string
  apps?: string
  consistency?: string
  wouldUse?: string
  observation?: string
  frustration?: string
  quote?: string
}

/** GET checks configuration, same contract as api/ask. POST synthesises
 *  insights from the team's logged interviews. The client is expected to have
 *  already stripped names/ages before sending — this also strips defensively
 *  server-side, since only fields explicitly listed here are ever forwarded
 *  to the model, so an unexpected extra field (like a name) can't leak through. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ configured: isConfigured() })
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  if (!isConfigured()) {
    res.status(503).json({ error: 'not_configured' })
    return
  }

  const { interviews } = (req.body ?? {}) as { interviews?: InterviewInput[] }
  if (!Array.isArray(interviews) || interviews.length === 0) {
    res.status(400).json({ error: 'no_interviews' })
    return
  }

  const sanitized = interviews.map((i) => ({
    venue: typeof i.venue === 'string' ? i.venue : undefined,
    routine: i.routine,
    choose: i.choose,
    problems: i.problems,
    apps: i.apps,
    consistency: i.consistency,
    wouldUse: i.wouldUse,
    observation: i.observation,
    frustration: i.frustration,
    quote: i.quote,
  }))

  const systemInstruction = `You are a careful product researcher. Synthesise ONLY from the interview data given — never invent facts, quotes, or numbers. Quotes in your output must be copied verbatim from the "quote" fields given (skip interviews with no quote). Reply with ONLY valid JSON, no markdown code fences, matching exactly this shape:
{"insights":[{"title":"","evidence":"","implication":""}] (exactly 3; look for underlying causes like cognitive load, social anxiety, or equipment bottlenecks, but only if the data actually supports it),
"persona":{"goal":"","behaviour":"","frustration":""} (a composite grounded only in the data given — no invented name or demographic details, since none were provided),
"problem":"2-3 sentences on why beginners drop off, grounded only in the data given"}`

  const userText = `INTERVIEWS (JSON — names and ages already removed):\n${JSON.stringify(sanitized)}`

  try {
    const raw = await callGemini(systemInstruction, userText, { maxOutputTokens: 900, temperature: 0.3 })
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()
    const parsed = JSON.parse(cleaned)
    res.status(200).json(parsed)
  } catch (err) {
    console.error('api/synthesize error:', err)
    res.status(502).json({ error: 'upstream_error' })
  }
}
