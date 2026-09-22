import type { CSSProperties, ReactNode } from 'react'

const DESIGN_WIDTH = 375

/** A CSS phone frame that renders `children` (the real /app tree) at native
 *  mobile width, then zooms it down to fit — `zoom` (unlike transform:scale)
 *  also shrinks layout height, so the internal scroll area stays accurate. */
export default function PhoneFrame({ children, width = 260, height = 560 }: { children: ReactNode; width?: number; height?: number }) {
  const zoomStyle: CSSProperties = { width: DESIGN_WIDTH, zoom: width / DESIGN_WIDTH } as CSSProperties
  return (
    <div
      className="relative overflow-hidden rounded-[2.2rem] border-[10px] border-rubber bg-bg shadow-2xl"
      style={{ width, height }}
    >
      <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-rubber/50" aria-hidden="true" />
      <div className="h-full w-full overflow-y-auto">
        <div style={zoomStyle}>{children}</div>
      </div>
    </div>
  )
}
