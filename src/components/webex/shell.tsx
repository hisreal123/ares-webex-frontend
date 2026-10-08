import type { ReactNode } from 'react'

type Variant = 'join' | 'prejoin' | 'lobby' | 'call'

const BACKGROUNDS: Record<Variant, React.CSSProperties> = {
  join: {
    backgroundColor: 'var(--webex-bg-base)',
    backgroundImage: 'url(/assets/images/join-bg.svg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  prejoin: {
    backgroundColor: 'var(--webex-page-dark)',
    backgroundImage: 'url(/assets/images/prejoin-bg.svg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  lobby: { background: 'var(--webex-call-bg)' },
  call: { background: 'var(--webex-call-bg)' },
}

// Page chrome shared by every Webex screen: themed background, the "webex by Cisco" logo, a footer slot.
export function WebexShell({
  variant,
  showLogo = true,
  momentum = false,
  children,
  footer,
}: {
  variant: Variant
  showLogo?: boolean
  momentum?: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      className="relative min-h-screen text-[var(--webex-text-primary)]"
      style={{
        ...BACKGROUNDS[variant],
        fontFamily: momentum ? 'var(--webex-font-momentum)' : 'var(--webex-font)',
        letterSpacing: 'normal',
      }}
    >
      {showLogo && (
        <a href="#" className="absolute left-[30px] top-[14.3px] z-10 block" aria-label="Cisco Webex">
          <img src="/assets/images/dark_logo.svg" alt="Cisco Webex" className="h-[48px]" />
        </a>
      )}
      {children}
      {footer}
    </div>
  )
}
