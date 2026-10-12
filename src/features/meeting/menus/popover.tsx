import { useEffect, useRef, type ReactNode } from 'react'

/** Webex's anchored popover: black card, 20% white border, 8px radius, and a small arrow pointing at its trigger. */
export function Popover({
  label,
  width,
  right,
  left,
  side = 'below',
  top,
  offsetTop,
  offsetBottom,
  arrowFromTop = 31,
  arrowFromLeft = 0,
  onClose,
  children,
  padding = 'p-[12px]',
}: {
  label: string
  width: number
  /** distance from the viewport's right edge (use this or `left`) */
  right?: number
  left?: number
  /** `below` hangs under the header buttons; `above` sits over the control bar */
  side?: 'below' | 'above' | 'right' | 'left'
  /** for `right`/`left`: distance from the viewport top, and the arrow's centre measured from the popover's top */
  top?: number
  arrowFromTop?: number
  /** override for `below`: distance from the viewport top (default 55.3) */
  offsetTop?: number
  offsetBottom?: number
  /** arrow centre, measured from the popover's left edge */
  arrowFromLeft?: number
  onClose: () => void
  children: ReactNode
  padding?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.dispatchEvent(new Event('webex-popover-open'))
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-popover-trigger]')) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      data-popover
      aria-label={label}
      className={`fixed z-[1003] box-border rounded-[8px] border border-[#ffffff33] bg-black text-[14px] leading-[20px] ${padding}`}
      style={{ width, right, left, ...(side === 'below' ? { top: offsetTop ?? 55.3 } : side === 'above' ? { bottom: offsetBottom ?? 67.3 } : { top }), animation: 'webex-dialog-fade 140ms ease-out both' }}
    >
      <div
        aria-hidden
        className="absolute h-[16px] w-[16px] rotate-45 bg-black"
        style={
          side === 'below'
            ? { left: arrowFromLeft - 8, top: -7, borderRadius: '3px 0 100%', borderTop: '1px solid #ffffff33', borderLeft: '1px solid #ffffff33' }
            : side === 'above'
              ? { left: arrowFromLeft - 8, bottom: -7, borderRadius: '100% 0 3px', borderBottom: '1px solid #ffffff33', borderRight: '1px solid #ffffff33' }
              : side === 'right'
                ? { left: -7, top: arrowFromTop - 8, borderRadius: '0 100% 0 3px', borderLeft: '1px solid #ffffff33', borderBottom: '1px solid #ffffff33' }
                : { right: -7, top: arrowFromTop - 8, borderRadius: '100% 0 3px 0', borderTop: '1px solid #ffffff33', borderRight: '1px solid #ffffff33' }
        }
      />
      {children}
    </div>
  )
}
