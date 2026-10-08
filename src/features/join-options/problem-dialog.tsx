import { useEffect, useRef } from 'react'

import { Icon } from '@/components/webex/icon'

/** Shown when the browser app doesn't come up in time ("webAppPreJoinFallbackTimeout" is 15s in Webex). */
export function ProblemJoiningDialog({ onTryAgain, onClose, onJoinOnMobile }: { onTryAgain: () => void; onClose: () => void; onJoinOnMobile?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <div className="fixed inset-0 z-[2001] text-center" style={{ fontFamily: 'var(--webex-font)', animation: 'webex-dialog-fade 220ms ease-out both' }}>
      <div className="fixed inset-0 z-[2000] bg-[#6a6b6c] opacity-50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Problem joining from browser?"
        className="absolute left-1/2 top-[35%] z-[2002] box-border w-[400px] max-w-[calc(100vw-16px)] -translate-x-1/2 rounded-[12px] border border-[#1a1a1a] bg-black text-left text-[var(--webex-text-primary)] [box-shadow:0_3px_8px_3px_#00000029]"
      >
        <button type="button" aria-label="Close" onClick={onClose} className="absolute left-[362px] top-[20px] z-[999] flex h-[19.4px] w-[16px] items-center justify-center text-[16px] text-[var(--webex-text-primary)]">
          <Icon name="cancel-bold" size={16} />
        </button>
        <div className="h-[33.8px]" />
        <div className="px-[20px] py-[10px] text-[14px] leading-[16.1px]">
          <div className="flex items-start">
            <img src="/assets/images/problem-joining.svg" alt="" className="mr-[8px] h-[52.94px] w-[68.39px]" />
            <div className="ml-[8px] w-[273.6px] pt-[8px]">
              <div className="text-[16px] font-bold leading-[24px]">Problem joining from browser?</div>
            </div>
          </div>
        </div>
        <div className="px-0 pb-[20px] pr-[20px] pt-[10px] text-right">
          <button
            ref={ref}
            type="button"
            onClick={onTryAgain}
            className="inline-block h-[40px] w-[93.53px] rounded-[25px] border border-[#ffffff4d] bg-transparent px-[12px] py-[4px] text-[16px] leading-[16px] text-[var(--webex-text-primary)] hover:bg-[var(--webex-surface)] active:bg-[var(--webex-disabled-bg)]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onJoinOnMobile}
            className="ml-[14.5px] inline-block h-[40px] w-[133.19px] rounded-[25px] bg-[#fffffff2] px-[12px] py-[4px] text-[16px] leading-[16px] text-[#000000f2] hover:brightness-95 active:brightness-90"
          >
            Join on mobile
          </button>
        </div>
      </div>
    </div>
  )
}
