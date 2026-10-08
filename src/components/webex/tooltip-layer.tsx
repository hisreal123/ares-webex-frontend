import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Tip = { text: string; rect: DOMRect; below: boolean }

const SHOW_DELAY_MS = 500

/**
 * One tooltip for the whole page: any element with `data-tooltip` gets Webex's black card with an arrow,
 * shown above it (or below with `data-tooltip-side="below"`) after a short hover or on keyboard focus.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const find = (t: EventTarget | null) => (t as HTMLElement | null)?.closest?.('[data-tooltip]') as HTMLElement | null
    const show = (el: HTMLElement, delay: number) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (!document.contains(el)) return
        setTip({ text: el.dataset.tooltip ?? '', rect: el.getBoundingClientRect(), below: el.dataset.tooltipSide === 'below' })
      }, delay)
    }
    const hide = () => {
      clearTimeout(timer.current)
      setTip(null)
    }
    const over = (e: MouseEvent) => {
      const el = find(e.target)
      if (el) show(el, SHOW_DELAY_MS)
    }
    const out = (e: MouseEvent) => {
      if (find(e.target) && !find(e.relatedTarget)) hide()
    }
    const focus = (e: FocusEvent) => {
      const el = find(e.target)
      if (el && (e.target as HTMLElement).matches?.(':focus-visible')) show(el, 0)
    }
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    document.addEventListener('focusin', focus)
    document.addEventListener('focusout', hide)
    document.addEventListener('mousedown', hide)
    document.addEventListener('keydown', hide)
    return () => {
      clearTimeout(timer.current)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('mousedown', hide)
      document.removeEventListener('keydown', hide)
    }
  }, [])

  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(0)
  useLayoutEffect(() => {
    if (!tip || !ref.current) return
    const w = ref.current.offsetWidth
    const center = tip.rect.x + tip.rect.width / 2
    setLeft(Math.min(Math.max(center - w / 2, 8), window.innerWidth - w - 8))
  }, [tip])

  if (!tip) return null
  const center = tip.rect.x + tip.rect.width / 2
  return (
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[1000] box-border rounded-[8px] border border-[#ffffff33] bg-black p-[12px] text-[14px] leading-[20px] text-[var(--webex-text-primary)]"
      style={{ left, ...(tip.below ? { top: 55.3 } : { bottom: 67.3 }), whiteSpace: 'nowrap', animation: 'webex-dialog-fade 120ms ease-out both', fontFamily: 'var(--webex-font-momentum)' }}
    >
      <div
        aria-hidden
        className="absolute h-[16px] w-[16px] rotate-45 bg-black"
        style={
          tip.below
            ? { left: center - left - 8, top: -7, borderRadius: '3px 0 100%', borderTop: '1px solid #ffffff33', borderLeft: '1px solid #ffffff33' }
            : { left: center - left - 8, bottom: -7, borderRadius: '100% 0 3px', borderBottom: '1px solid #ffffff33', borderRight: '1px solid #ffffff33' }
        }
      />
      {tip.text}
    </div>
  )
}
