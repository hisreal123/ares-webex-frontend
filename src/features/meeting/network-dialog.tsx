import { useEffect, useState } from 'react'

import { Icon } from '@/components/webex/icon'

type Phase = 'problem' | 'checking' | 'ok'

/** Webex's own network pre-check dialog. Real guests rarely see it, so it's opt-in via `?network=1`. */
export function NetworkIssuesDialog({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('problem')

  useEffect(() => {
    if (phase !== 'checking') return
    const t = setTimeout(() => setPhase('ok'), 2000)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Network issues detected"
      className="fixed left-1/2 top-1/2 z-[1000] box-border flex h-[238px] w-[432px] max-w-[calc(100vw-16px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[8px] border border-[#ffffff33] bg-black p-[24px] text-[14px] leading-[20px]"
      style={{ animation: 'webex-dialog-fade 160ms ease-out both' }}
    >
      <div className="flex items-center justify-between px-[1px]">
        <h2 className="text-[16px] font-bold leading-[24px]">Network issues detected</h2>
        <button type="button" aria-label="OK" onClick={onClose} className="flex h-[20px] w-[20px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)]">
          <Icon name="cancel-bold" size={16} />
        </button>
      </div>
      <p className="mt-[16px] h-[100px] w-[382px] px-[1px]">
        {phase === 'problem' && (
          <>
            Your network doesn't meet the{' '}
            <a href="#" className="text-[var(--webex-link)] underline">network requirements for Webex services</a>, so you can't join meetings. Try a different network or turn off VPN, then select Try again. If this keeps happening, contact your network administrator.
          </>
        )}
        {phase === 'checking' && 'Checking your network…'}
        {phase === 'ok' && "You'll be able to join meetings."}
      </p>
      <div className="flex justify-end gap-[8px]">
        {phase !== 'checking' && (
          <button type="button" onClick={onClose} className="mt-[16px] h-[32px] rounded-[20px] border border-[var(--webex-outline)] px-[12px] text-[16px] font-medium leading-[24px] hover:bg-[var(--webex-surface)]">OK</button>
        )}
        {phase === 'problem' && (
          <button type="button" onClick={() => setPhase('checking')} className="mt-[16px] h-[32px] rounded-[20px] bg-[#fffffff2] px-[12px] text-[16px] font-medium leading-[24px] text-[#000000f2] hover:brightness-95 active:brightness-90">Try again</button>
        )}
      </div>
    </div>
  )
}
