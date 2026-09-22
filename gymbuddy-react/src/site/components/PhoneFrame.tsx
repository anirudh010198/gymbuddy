import type { CSSProperties, ReactNode } from 'react'

const DESIGN_WIDTH = 375
const BORDER = 10

/** A CSS phone frame that renders `children` (the real /app tree) at native
 *  mobile width, then zooms it down to fit — `zoom` (unlike transform:scale)
 *  also shrinks layout height, so the internal scroll area stays accurate,
 *  AND (unlike transform:scale) does not establish a containing block for
 *  position:fixed descendants, so they keep sizing against the outer frame
 *  below rather than the zoomed content box. */
export default function PhoneFrame({ children, width = 260, height = 560 }: { children: ReactNode; width?: number; height?: number }) {
  // The frame is border-box, so `width` already includes the 10px border on
  // each side — the zoom factor must be based on the space actually left
  // for content (width - 2*BORDER), not the full outer width. Using the
  // outer width here was rendering content ~20px too wide for its box,
  // clipping the right edge (e.g. "Change goal" -> "Change go...").
  const innerWidth = width - BORDER * 2
  const zoomStyle: CSSProperties = { width: DESIGN_WIDTH, zoom: innerWidth / DESIGN_WIDTH } as CSSProperties
  return (
    <div
      className="relative overflow-hidden rounded-[2.2rem] border-[10px] border-rubber bg-bg shadow-2xl"
      // transform (any non-none value, even a no-op translateZ(0)) makes this box
      // the containing block for position:fixed descendants. Without it, the
      // real app's Dock/Toast/Sheet (all position:fixed) skip straight past this
      // frame and anchor to the real page viewport instead — the frame's own
      // overflow-hidden then clips them to its rounded-rect bounds too.
      // contain: layout paint is redundant belt-and-suspenders with overflow-hidden.
      style={{ width, height, transform: 'translateZ(0)', contain: 'layout paint' }}
    >
      <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-rubber/50" aria-hidden="true" />
      <div className="h-full w-full overflow-y-auto overflow-x-hidden">
        <div style={zoomStyle}>{children}</div>
      </div>
    </div>
  )
}
