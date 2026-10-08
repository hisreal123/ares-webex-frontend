import { useEffect, useRef, useState } from 'react'

import { CookieBanner } from '@/components/webex/cookie-banner'
import { LogoLoader } from '@/components/webex/logo-loader'
import { ProblemJoiningDialog } from './problem-dialog'
import { WebexShell } from '@/components/webex/shell'

const CARD =
  'flex h-[136px] w-[330px] cursor-pointer items-center justify-center rounded-[12px] bg-[var(--webex-card)] ' +
  'transition-all hover:bg-[var(--webex-card-hover)] active:bg-[var(--webex-card-pressed)] ' +
  'focus:bg-[var(--webex-card-pressed)] focus:outline-2 focus:outline-solid focus:outline-[var(--webex-control-active)]'

// Mirrors Webex's .broadcom-helper: padding 20px, a 32px inline icon, then a 24px-line title.
function Card({ label, icon, onClick, className = '', autoFocus }: {
  label: string
  icon: string
  onClick?: () => void
  className?: string
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={`${CARD} ${className}`}
    >
      <div className="p-[20px]" style={{ fontSize: 12, lineHeight: '13.8px' }}>
        <img src={icon} alt="" width={32} height={32} className="inline align-baseline" />
        <div className="text-[16px] font-bold leading-[24px] text-[var(--webex-text-primary)]">{label}</div>
      </div>
    </div>
  )
}

// After "Join from this browser", Webex shows its animated logo while the web app loads (usually 1-3s).
const SPLASH_MS = 2200
// If the browser app never comes up, Webex gives up after 15s and offers a fallback dialog.
const PROBLEM_AFTER_MS = 15000

// Webex's page loads in three beats: a blank dark page, the logo, then the content.
const STAGE_DELAYS_MS = [350, 900]

function useLoadStage() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const timers = STAGE_DELAYS_MS.map((ms, i) => setTimeout(() => setStage(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [])
  return stage
}

export function JoinOptionsPage({ onJoinFromBrowser, simulateProblem = false }: { onJoinFromBrowser?: () => void; simulateProblem?: boolean }) {
  const stage = useLoadStage()
  const [launching, setLaunching] = useState(false)
  const [problem, setProblem] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const launch = () => {
    if (launching) return
    setLaunching(true)
    setProblem(false)
    // Normally the app is ready after a moment. With ?problem=1 it never is, so the fallback dialog appears.
    timer.current = setTimeout(() => (simulateProblem ? setProblem(true) : onJoinFromBrowser?.()), simulateProblem ? PROBLEM_AFTER_MS : SPLASH_MS)
  }

  return (
    <>
      <WebexShell
        variant="join"
        showLogo={stage >= 1 && !launching}
        footer={
          stage >= 2 && (
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 px-[16px] py-[12px] text-[14px] leading-[24px] text-[var(--webex-text-secondary)]">
              Having issues?{' '}
              <a href="#" className="text-[var(--webex-link)] no-underline">Report an issue</a>
            </div>
          )
        }
      >
        <header className="h-[77px]" />
        {launching && (
          <main className="absolute inset-x-0 top-[255px]">
            <LogoLoader />
          </main>
        )}
        {stage >= 2 && !launching && (
          <main className="mt-[120px] text-center">
            <div role="heading" aria-level={1} className="text-[26px] font-bold leading-[29.9px] text-[var(--webex-text-primary)]">
              Join your Webex meeting
            </div>

            <div className="mt-[40px] inline-flex">
              <Card label="Download the Webex app" icon="/assets/images/icon-download-app.svg" className="mr-[8px] opacity-90" />
              <Card label="Join from this browser" icon="/assets/images/icon-join-browser.svg" onClick={launch} autoFocus />
            </div>

            <div className="my-[40px] h-px">
              <div
                className="relative top-[-7px] inline-block h-px w-[800px] max-w-full"
                style={{ background: 'radial-gradient(50% 50% at 50% 50%, #9b9b9b 0, #ffffff03 100%)' }}
              />
            </div>

            <div className="text-[16px] leading-[24px] text-[var(--webex-text-secondary)]">
              Already have Webex?{' '}
              <a href="#" role="button" className="text-[var(--webex-link)] no-underline">Join from the Webex app</a>
            </div>
          </main>
        )}
      </WebexShell>
      {stage >= 1 && <CookieBanner surface="join" />}
      {problem && (
        <ProblemJoiningDialog
          onTryAgain={() => {
            setLaunching(false)
            setProblem(false)
            clearTimeout(timer.current)
          }}
          onClose={() => setProblem(false)}
        />
      )}
    </>
  )
}
