import type { VercelRequest, VercelResponse } from '@vercel/node'
import { BY_ID } from '../src/engine/exercises'
import { GOALS } from '../src/engine/goals'
import type { GoalKey } from '../src/engine/types'
import { callGemini, isConfigured } from './_gemini'

/** GET checks whether the API key is configured (used by the frontend to decide
 *  whether to show the "Ask GymBuddy" button at all). POST asks a question. */
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

  const { exerciseId, question, goal } = (req.body ?? {}) as { exerciseId?: string; question?: string; goal?: string }
  if (typeof exerciseId !== 'string' || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'bad_request' })
    return
  }

  // Look up the exercise server-side from the trusted engine data rather than
  // trusting client-supplied cue text for the system prompt.
  const exercise = BY_ID[exerciseId]
  if (!exercise) {
    res.status(400).json({ error: 'unknown_exercise' })
    return
  }
  const goalLabel = GOALS[(goal as GoalKey) ?? 'fit']?.label ?? 'general fitness'

  const systemInstruction = `You are GymBuddy, a cautious coach for complete beginners at the gym. Answer in plain, simple words, in at most 3 short sentences. Never diagnose an injury — if the question mentions pain, discomfort, or something feeling wrong, tell them to stop that movement today and ask a gym trainer or doctor, rather than guessing what's wrong. Stay focused on the exercise given below; don't invent facts about the user.

Exercise: ${exercise.name}
Muscles worked: ${exercise.muscles}
How to do it: ${exercise.how}
Avoid: ${exercise.avoid}
Starting weight guidance: ${exercise.start}
User's goal: ${goalLabel}`

  try {
    const answer = await callGemini(systemInstruction, question.trim().slice(0, 500), { maxOutputTokens: 200 })
    res.status(200).json({ answer })
  } catch (err) {
    console.error('api/ask error:', err)
    res.status(502).json({ error: 'upstream_error' })
  }
}
