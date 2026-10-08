import { Icon, type IconName } from '@/components/webex/icon'
import { MEETING_LINK } from '../config'
import { Popover } from './popover'

const ITEMS: { id: string; label: string; icon: IconName }[] = [
  { id: 'copy', label: 'Copy meeting link', icon: 'copy-bold' },
  { id: 'report', label: 'Report an issue', icon: 'note-bold' },
  { id: 'away', label: 'Step away from the meeting', icon: 'coffee-bold' },
]

export function MoreMenu({ anchorX, away, onStepAway, onClose }: { anchorX: number; away: boolean; onStepAway: () => void; onClose: () => void }) {
  const run = (id: string) => {
    if (id === 'away') onStepAway()
    if (id === 'copy') void navigator.clipboard?.writeText(MEETING_LINK).catch(() => undefined)
    onClose()
  }
  return (
    <Popover label="More" width={away ? 229 : 262.9} left={anchorX - (away ? 114.5 : 131.4)} arrowFromLeft={away ? 114.5 : 131.4} side="above" onClose={onClose} padding="px-[8px] py-[12px]">
      <section aria-label="Meeting" className="w-[244.9px]">
        <div className="px-[12px] pt-[8px] text-[14px] font-bold leading-[20px]">Meeting</div>
        <div className="mt-[8px]">
          {ITEMS.map((i, idx) => (
            <button key={i.id} type="button" role="menuitem" autoFocus={idx === 0} onClick={() => run(i.id)} className="flex h-[38px] w-full items-center gap-[12px] rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]">
              <Icon name={i.icon} size={22} />
              {i.id === 'away' && away ? 'Go back to the meeting' : i.label}
            </button>
          ))}
        </div>
      </section>
    </Popover>
  )
}
