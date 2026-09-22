import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Wrap({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto px-4 pb-32 pt-2 ${wide ? 'max-w-[1040px]' : 'max-w-[480px]'}`}>{children}</div>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border border-line bg-card ${className}`}>{children}</div>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-full bg-soft px-2.5 py-1 text-[0.8rem] font-semibold text-muted">{children}</span>
}

export function Chip({
  pressed,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`w-full rounded-2xl border-2 bg-card p-3.5 text-left text-ink ${pressed ? 'border-plate bg-plate/[0.16]' : 'border-line'} ${className}`}
      {...props}
    />
  )
}

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`min-h-[52px] w-full rounded-2xl bg-plate px-4 py-3.5 font-display text-xl font-bold text-plate-ink transition-transform active:scale-[0.98] disabled:opacity-45 ${className}`}
      {...props}
    />
  )
}

export function GhostButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`min-h-[52px] w-full rounded-2xl border-2 border-line px-4 py-3.5 font-display text-xl font-bold text-ink transition-transform active:scale-[0.98] ${className}`}
      {...props}
    />
  )
}

export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-bg from-70% to-transparent p-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto max-w-[480px]">{children}</div>
    </div>
  )
}
