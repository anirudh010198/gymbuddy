import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

/** Mounted once, near the app root. registerType is 'prompt' (see
 *  vite.config.ts), so a waiting update never activates on its own — this
 *  is what surfaces it instead of leaving the visitor on a silently-stale
 *  bundle until their next unrelated reload. */
export default function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateFn, setUpdateFn] = useState<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
    })
    setUpdateFn(() => update)
  }, [])

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-[70] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-neon">
        <p className="text-sm font-semibold">A new version is available.</p>
        <button
          type="button"
          className="shrink-0 rounded-xl bg-plate px-3 py-2 font-display text-sm font-bold text-plate-ink"
          onClick={() => updateFn?.(true)}
        >
          Reload
        </button>
      </div>
    </div>
  )
}
