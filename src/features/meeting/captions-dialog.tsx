import { useEffect, useRef } from 'react'

import { Icon } from '@/components/webex/icon'

export function CaptionsDialog({ onClose }: { onClose: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1004] flex items-center justify-center bg-[#00000066]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Closed captions are unavailable"
        aria-description="Ask the host to turn on manual captioning and give access to the captioning service."
        className="box-border flex w-[432px] flex-col rounded-[8px] border border-[#ffffff33] bg-black p-[24px] text-[var(--webex-text-primary)]"
      >
        <div className="flex items-start gap-[8px]">
          <h2 className="flex-1 text-[16px] font-bold leading-[24px]">Closed captions are unavailable</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-transparent p-px outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59]">
            <Icon name="cancel-bold" size={16} />
          </button>
        </div>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[var(--webex-text-secondary)]">Ask the host to turn on manual captioning and give access to the captioning service.</p>
        <div className="mt-[32px] flex justify-end">
          <button ref={okRef} type="button" onClick={onClose} className="h-[32px] rounded-[20px] border border-transparent bg-[#fffffff2] px-[12px] text-[16px] font-medium leading-[24px] text-[#000000f2] outline-none hover:bg-[#ffffffcc] focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59] active:bg-[#ffffffb3]">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
