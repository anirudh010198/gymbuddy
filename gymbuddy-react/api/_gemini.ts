// Shared Gemini call helper. Underscore-prefixed filename so Vercel excludes
// it from routing — this is a module, not an endpoint.
//
// Model: gemini-flash-latest — Google's auto-updating alias for the current
// GA Flash model (currently backed by Gemini 3.8 Flash as of this build,
// confirmed against ai.google.dev/gemini-api/docs/pricing and .../models).
// Using the alias instead of a dated model string means this doesn't need
// updating every time Google ships a new Flash release.
const GEMINI_MODEL = 'gemini-flash-latest'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export function isConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}

export async function callGemini(
  systemInstruction: string,
  userText: string,
  opts?: { maxOutputTokens?: number; temperature?: number },
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: opts?.temperature ?? 0.4,
        maxOutputTokens: opts?.maxOutputTokens ?? 300,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string' || !text.trim()) throw new Error('Empty response from Gemini')
  return text.trim()
}
