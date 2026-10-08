import { Icon } from '@/components/webex/icon'
import { Popover } from './popover'

export type SortKey = 'name' | 'raised'

export function SortMenu({ anchorX, value, onChange, onClose }: { anchorX: number; value: SortKey; onChange: (v: SortKey) => void; onClose: () => void }) {
  return (
    <Popover label="Sort" width={142.6} right={window.innerWidth - (anchorX - 122 + 142.6)} arrowFromLeft={122} side="below" top={undefined} onClose={onClose} padding="px-[8px] py-[12px]" offsetTop={149.3}>
      <section aria-label="Sort by" className="w-[124.6px]">
        <div className="px-[12px] pt-[8px] text-[14px] font-bold leading-[20px]">Sort by</div>
        <div className="mt-[8px]" role="radiogroup" aria-label="Sort by">
          {([['name', 'Name'], ['raised', 'Raise hand']] as [SortKey, string][]).map(([k, label]) => (
            <button key={k} type="button" role="menuitemradio" aria-checked={value === k} autoFocus={value === k} onClick={() => { onChange(k); onClose() }} className="flex h-[36px] w-full items-center rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]">
              <span className="flex-1">{label}</span>
              {value === k && <Icon name="check-bold" size={16} />}
            </button>
          ))}
        </div>
      </section>
    </Popover>
  )
}
