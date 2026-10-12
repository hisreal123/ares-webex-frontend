import { useEffect, useState } from 'react'

import { Icon } from '@/components/webex/icon'

const FOCUS = 'outline-none focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59]'

export function EditNameDialog({ name, onSave, onClose }: { name: string; onSave: (name: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(name)
  const valid = value.trim().length > 0 && value.trim() !== name
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  const save = () => {
    if (!valid) return
    onSave(value.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1004] flex items-center justify-center bg-[#00000066]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Edit display name" className="box-border flex w-[432px] flex-col rounded-[8px] border border-[#ffffff33] bg-black p-[24px] text-[var(--webex-text-primary)]">
        <div className="flex items-start gap-[8px]">
          <h2 className="flex-1 text-[16px] font-bold leading-[24px]">Edit display name</h2>
          <button type="button" aria-label="Close" onClick={onClose} className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border border-transparent p-px hover:bg-[var(--webex-surface)] ${FOCUS}`}>
            <Icon name="cancel-bold" size={16} />
          </button>
        </div>
        <div className="mt-[16px] flex h-[32px] items-center rounded-[8px] border border-[var(--webex-outline)] py-[5.5px] pl-[12px] pr-[6px] focus-within:border-[#ffffffe6] focus-within:[box-shadow:var(--webex-focus-ring)]">
          <input
            autoFocus
            aria-label="Display name"
            maxLength={128}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="h-[20px] min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] outline-none"
          />
        </div>
        <div className="mt-[32px] flex justify-end gap-[8px]">
          <button type="button" onClick={onClose} className={`h-[32px] rounded-[20px] border border-[var(--webex-outline)] px-[12px] text-[16px] font-medium leading-[24px] hover:bg-[var(--webex-surface)] ${FOCUS}`}>
            Cancel
          </button>
          <button type="button" disabled={!valid} onClick={save} className={`h-[32px] rounded-[20px] border border-transparent bg-[#fffffff2] px-[12px] text-[16px] font-medium leading-[24px] text-[#000000f2] hover:bg-[#ffffffcc] disabled:bg-[var(--webex-disabled-bg)] disabled:text-[var(--webex-disabled-text)] ${FOCUS}`}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
