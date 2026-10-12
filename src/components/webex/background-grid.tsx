import { Icon } from '@/components/webex/icon'
import { backgroundOptions } from '@/features/pre-join/data/backgrounds'
import type { BackgroundSelection } from '@/features/pre-join/types'

const ITEMS: { key: string; label: string; selection: BackgroundSelection; icon?: string; img?: string }[] = [
  { key: 'none', label: 'None', selection: 'none', icon: 'blocked-bold' },
  { key: 'blur', label: 'Blur', selection: 'blur', icon: 'video-blur-bold' },
  ...backgroundOptions.map((o) => ({ key: o.id, label: o.label, selection: { imageId: o.id }, img: o.thumbnailSrc })),
]

export function BackgroundGrid({ value, onChange, className = '' }: { value: BackgroundSelection; onChange: (value: BackgroundSelection) => void; className?: string }) {
  const current = typeof value === 'string' ? value : value.imageId
  return (
    <div role="group" aria-label="Virtual background" className={`grid grid-cols-[repeat(4,76px)] gap-[2px] p-[4px] ${className}`}>
      {ITEMS.map((item) => {
        const selected = current === item.key
        return (
          <button
            key={item.key}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            aria-label={item.label}
            onClick={() => onChange(item.selection)}
            className="h-[48px] w-[76px] rounded-[10px] p-[4px] outline-none focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]"
          >
            <span className="box-border block h-[40px] w-[68px] rounded-[6px] p-[2px]" style={selected ? { boxShadow: '0 0 0 2px #64b4fa' } : undefined}>
              {item.img ? (
                <img src={item.img} alt="" className="h-[36px] w-[64px] rounded-[4px] object-cover" />
              ) : (
                <span className="flex h-[36px] w-[64px] flex-col items-center justify-center rounded-[4px] bg-[#ffffff33]">
                  <Icon name={item.icon!} size={16} />
                  <span className="text-[12px] leading-[16px]">{item.label}</span>
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
