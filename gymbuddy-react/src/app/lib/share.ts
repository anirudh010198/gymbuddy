/** Web Share API where available (native share sheet — includes WhatsApp
 *  as one of the targets on most phones already); a direct wa.me deep link
 *  as the fallback everywhere else (desktop browsers, unsupported mobile
 *  browsers) so "share to WhatsApp" always works one way or the other. */
export async function shareText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text })
      return
    } catch {
      // User cancelled the native share sheet, or it failed — fall through
      // to the WhatsApp link rather than leaving them with nothing to tap.
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}
