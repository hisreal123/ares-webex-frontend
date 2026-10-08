import { useEffect, useRef } from 'react'

import { Icon } from '@/components/webex/icon'
import { Popover } from './popover'

/** The red button opens this one-item menu; the guest leaves only after choosing the item. */
export function LeaveMenu({ anchorX, onLeave, onClose }: { anchorX: number; onLeave: () => void; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <Popover label="Leave meeting menu" width={172.9} left={anchorX - 86.5} arrowFromLeft={86.5} side="above" onClose={onClose} padding="px-[8px] py-[12px]">
      <button
        ref={ref}
        type="button"
        role="menuitem"
        onClick={onLeave}
        className="flex h-[38px] w-[154.9px] items-center gap-[12px] rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]"
      >
        <Icon name="exit-room-bold" size={22} />
        Leave meeting
      </button>
    </Popover>
  )
}
