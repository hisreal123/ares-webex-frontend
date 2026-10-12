import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './icon'

const PILL = 'inline-flex h-full items-center justify-center text-[16px] font-medium leading-[24px] text-[var(--webex-text-primary)] outline-none focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59]'
const HOVER = 'hover:bg-[var(--webex-surface)] active:bg-[var(--webex-disabled-bg)]'

export function WarningBadge() {
  return (
    <span
      className="absolute right-[-1px] top-[-2px] z-[1] inline-flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[var(--webex-warning-bg)] p-[2px] text-[var(--webex-warning)] outline outline-1 outline-black"
      aria-hidden
    >
      <Icon name="warning-badge-filled" size={12} />
    </span>
  )
}

// Webex's split control: a labelled toggle with a chevron for its options menu.
export function SplitButton({ icon, label, warning, on, onToggle, onOptions, optionsLabel, ariaLabel, width, tooltip, optionsTooltip }: {
  icon: IconName
  label: string
  warning?: boolean
  /** true: device is live (green icon). false: muted/off (pink-red icon). */
  on: boolean
  onToggle: () => void
  onOptions?: (anchorX: number) => void
  optionsLabel: string
  ariaLabel: string
  tooltip?: string
  optionsTooltip?: string
  /** Minimum group width: Webex sizes the mic group to its widest label so the bar doesn't shift. */
  width: number
}) {
  return (
    <div className="relative mr-[8px] box-border inline-flex h-[40px] rounded-[20px]" style={{ minWidth: width }}>
      <button type="button" aria-label={ariaLabel} data-tooltip={tooltip} onClick={onToggle} className={`${PILL} ${HOVER} relative flex-1 gap-[8px] whitespace-nowrap rounded-l-[20px] border border-r-0 border-[var(--webex-outline)] px-[16px]`}>
        <Icon name={icon} size={20} className={on ? 'text-[var(--webex-success)]' : 'text-[var(--webex-muted-red)]'} />
        {label}
        {warning && <WarningBadge />}
      </button>
      <button type="button" aria-label={optionsLabel} data-tooltip={optionsTooltip} data-popover-trigger onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onOptions?.(r.x + r.width / 2) }} className={`${PILL} ${HOVER} w-[40px] rounded-r-[20px] border border-l-0 border-[var(--webex-outline)] [box-shadow:inset_1px_0_0_var(--webex-outline)]`}>
        <Icon name="arrow-down-bold" size={20} />
      </button>
    </div>
  )
}

/** Outlined pill (Share, Participants, Layout...). `height` 40 for the control bar, 28 for the header. */
export function PillButton({ icon, children, height = 40, iconSize = 20, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName
  children?: ReactNode
  height?: 40 | 28
  iconSize?: number
}) {
  const small = height === 28
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center rounded-[20px] border border-[var(--webex-outline)] font-medium text-[var(--webex-text-primary)] ${HOVER} ${
        small ? 'h-[28px] gap-[6px] px-[12px] text-[14px] leading-[20px]' : 'h-[40px] gap-[8px] px-[16px] text-[16px] leading-[24px]'
      } ${className}`}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  )
}

export function CircleButton({ icon, size = 40, iconSize = 20, danger, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  size?: number
  iconSize?: number
  danger?: boolean
}) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[var(--webex-text-primary)] ${
        danger ? 'bg-[var(--webex-leave)] hover:brightness-110 active:brightness-90' : `border border-[var(--webex-outline)] ${HOVER}`
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}

export function PositiveButton({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      className="mt-[32px] flex h-[40px] w-full items-center justify-center gap-[8px] rounded-[20px] border border-transparent px-[16px] text-[16px] font-medium leading-[24px] enabled:cursor-pointer enabled:bg-[var(--webex-positive)] enabled:text-[var(--webex-text-primary)] enabled:hover:brightness-110 enabled:active:brightness-90 disabled:cursor-not-allowed disabled:bg-[var(--webex-disabled-bg)] disabled:text-[var(--webex-disabled-text)]"
    >
      {children}
    </button>
  )
}

export function Avatar({ initials, size = 124, fontSize }: { initials: string; size?: number; fontSize?: number }) {
  return (
    <div
      className="flex select-none items-center justify-center rounded-full bg-[var(--webex-avatar)] font-medium text-[var(--webex-text-primary)]"
      style={{ width: size, height: size, fontSize: fontSize ?? size * 0.32, lineHeight: 1.25 }}
      aria-hidden
    >
      {initials ? initials : <Icon name="participant-light" size={size * 0.6} />}
    </div>
  )
}


export function LinkButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[4px] text-[var(--webex-link)] underline">
      {children}
    </button>
  )
}
