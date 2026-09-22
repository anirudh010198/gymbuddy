/** The signature plate motif — a circle with a centre hole, reused sparingly
 *  (logo mark, hero, loading states) per the design system. Uses currentColor
 *  so callers control the color via a text-* class. */
export default function PlateLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="5" />
    </svg>
  )
}
