import { useEffect, useRef } from 'react'

type Step = 1 | 2

// Webex asks in two steps: mic + camera first, then (if skipped) just the microphone.
const COPY: Record<Step, { title: string; description: string; use: string; skip: string }> = {
  1: {
    title: 'Allow Webex to use your microphone and camera.',
    description: 'You can turn them off anytime.',
    use: 'Use microphone and camera',
    skip: 'Continue without microphone and camera',
  },
  2: {
    title: 'Allow Webex to use your microphone.',
    description: 'You can mute anytime.',
    use: 'Use microphone',
    skip: 'Continue without microphone',
  },
}

export function PermissionDialog({ step, onUse, onSkip }: { step: Step; onUse: () => void; onSkip: () => void }) {
  const copy = COPY[step]
  const useRef_ = useRef<HTMLButtonElement>(null)
  useEffect(() => useRef_.current?.focus(), [step])

  return (
    <div className="fixed inset-0 z-[998] bg-[#07101cb3]" style={{ fontFamily: 'var(--webex-font-momentum)' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        aria-description={copy.description}
        className="fixed left-1/2 top-1/2 z-[1000] box-border flex h-[292px] w-[500px] max-w-[calc(100vw-16px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[8px] border border-[#ffffff33] bg-black p-[24px] [box-shadow:0_6px_24px_#00000040]"
      >
        <h2 className="mt-[40px] text-center text-[16px] font-bold leading-[24px] text-[var(--webex-text-primary)]">{copy.title}</h2>
        <p className="mt-[4px] text-[14px] leading-[20px] text-[var(--webex-text-secondary)]">{copy.description}</p>
        <button
          ref={useRef_}
          type="button"
          onClick={onUse}
          // Webex uses Chrome's native <usermedia> permission button here, which draws its label in the system font.
          style={{ fontFamily: 'var(--webex-font-native-control)' }}
          className="mt-[38px] box-border h-[44px] rounded-[22px] border-2 border-black bg-[var(--webex-primary-blue)] px-[16px] text-[16px] font-normal leading-[40px] text-[#f3f8fd] outline-none hover:brightness-110 focus-visible:[box-shadow:var(--webex-focus-ring)] active:brightness-90"
        >
          {copy.use}
        </button>
        <button type="button" onClick={onSkip} className="mt-[12px] rounded-[4px] text-[14px] leading-[20px] text-[var(--webex-link)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none">
          {copy.skip}
        </button>
      </div>
    </div>
  )
}
