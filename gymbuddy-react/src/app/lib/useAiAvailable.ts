import { useEffect, useState } from 'react'

/** True only when the browser is online AND the serverless function reports
 *  GEMINI_API_KEY is configured. The core workout never depends on this —
 *  callers use it purely to decide whether to show an AI-powered button. */
export function useAiAvailable(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    function goOnline() {
      setOnline(true)
    }
    function goOffline() {
      setOnline(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (!online) return
    let cancelled = false
    fetch('/api/ask')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setConfigured(!!d.configured)
      })
      .catch(() => {
        /* api unreachable (e.g. local `vite dev` with no serverless functions) — stays unconfigured */
      })
    return () => {
      cancelled = true
    }
  }, [online])

  return online && configured
}
