import { Icon } from '@/components/webex/icon'
import { Popover } from './popover'

/** The little "what do you want to share?" card above the Share button. */
export function ShareMenu({ anchorX, onClose }: { anchorX: number; onClose: () => void }) {
  return (
    <Popover label="Share" width={336} left={anchorX - 168} arrowFromLeft={168} side="above" onClose={onClose} padding="p-[28px]">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute right-[16px] top-[11px] flex h-[20px] w-[20px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none">
        <Icon name="cancel-bold" size={16} />
      </button>
      <p className="h-[40px] w-[278px] text-[14px] leading-[20px]">Click <strong className="font-bold">Share</strong> to share content in the meeting.</p>
      <label className="mt-[20px] block text-[14px] font-medium leading-[20px]">What do you want to share?</label>
      <div className="mt-[8px] flex items-center">
        <div className="box-border flex h-[32px] w-[251.7px] items-center gap-[6px] rounded-[8px] border border-[var(--webex-outline)] py-[5.5px] pl-[12px] pr-[6px]">
          <span className="flex-1 text-[14px] leading-[20px]">Optimize for text and images</span>
          <Icon name="arrow-down-bold" size={16} />
        </div>
        <button type="button" aria-label="Description of optimization" className="ml-[4px] flex h-[20px] w-[18.3px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)]">
          <Icon name="info-circle-bold" size={16} />
        </button>
      </div>
      <button type="button" onClick={onClose} className="mt-[40px] flex h-[28px] w-[278px] items-center justify-center gap-[6px] rounded-[20px] bg-[#fffffff2] px-[12px] text-[14px] font-medium leading-[20px] text-[#000000f2] hover:brightness-95 active:brightness-90">
        <Icon name="share-screen-bold" size={16} /> Share
      </button>
    </Popover>
  )
}
