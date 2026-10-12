import { Icon } from '@/components/webex/icon'
import { Popover } from './popover'

/** The menu behind the "..." on a participant's tile. It opens beside the button, on whichever side has room. */
export function TileMenu({ name, anchor, onStage, onToggleStage, onClose }: { name: string; anchor: DOMRect; onStage: boolean; onToggleStage: () => void; onClose: () => void }) {
  const WIDTH = 352
  const HEIGHT = 62
  const MIN_TOP = 64
  const BOTTOM_GAP = 114
  const right = anchor.right + 15.3 + WIDTH <= window.innerWidth - 8
  const center = anchor.y + anchor.height / 2
  const top = Math.max(MIN_TOP, Math.min(center - 31, window.innerHeight - BOTTOM_GAP - HEIGHT))
  return (
    <Popover
      label="More options menu"
      width={WIDTH}
      left={right ? anchor.right + 15.3 : anchor.x - 15.3 - WIDTH}
      top={top}
      side={right ? 'right' : 'left'}
      arrowFromTop={center - top}
      onClose={onClose}
      padding="px-[8px] py-[12px]"
    >
      <section aria-label="General options" className="w-[334px]">
        <button type="button" role="menuitem" autoFocus aria-label={`${onStage ? 'Remove' : 'Move'} ${name} ${onStage ? 'from' : 'to'} stage`} onClick={() => { onToggleStage(); onClose() }} className="flex h-[36px] w-full items-center gap-[12px] rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]">
          <Icon name="pin-bold" size={16} />
          {onStage ? 'Remove from stage' : 'Move to stage'}
        </button>
      </section>
    </Popover>
  )
}
