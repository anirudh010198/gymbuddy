import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** Chromium/Android fire `beforeinstallprompt`, which we capture and can
 *  trigger on demand later (`promptInstall`). iOS Safari never fires it —
 *  there's no programmatic install there, only the manual Share sheet, so
 *  callers should fall back to instructional copy when `isIOS` is true. */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return { installed, canPrompt: !!deferred, isIOS: isIOS(), promptInstall }
}
