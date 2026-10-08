import { Icon, type IconName } from '@/components/webex/icon'
import { Popover } from './popover'

export type LayoutKind = 'grid' | 'stack' | 'side-by-side'

const OPTIONS: { id: LayoutKind; label: string; icon: IconName; selectedIcon: IconName }[] = [
  { id: 'grid', label: 'Grid', icon: 'video-layout-equal-bold', selectedIcon: 'video-layout-equal-filled' },
  { id: 'stack', label: 'Stack', icon: 'video-layout-stack-bold', selectedIcon: 'video-layout-stack-bold' },
  { id: 'side-by-side', label: 'Side by side', icon: 'layout-side-by-side-vertical-bold', selectedIcon: 'layout-side-by-side-vertical-bold' },
]

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className="box-border flex h-[16px] w-[32px] shrink-0 items-center rounded-[8px] border p-px"
      style={{
        background: on ? 'var(--webex-link)' : 'var(--webex-tile)',
        borderColor: on ? 'transparent' : 'var(--webex-outline)',
        justifyContent: on ? 'flex-end' : 'flex-start',
      }}
    >
      <span className="flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[#fffffff2] text-[#00000099]">
        <Icon name={on ? 'check-bold' : 'cancel-bold'} size={8} className={on ? 'text-[#1170cf]' : ''} />
      </span>
    </span>
  )
}

export function LayoutMenu({ layout, onLayout, fullscreen, onFullscreen, hideNames, onHideNames, onClose }: {
  layout: LayoutKind
  onLayout: (l: LayoutKind) => void
  fullscreen: boolean
  onFullscreen: (v: boolean) => void
  hideNames: boolean
  onHideNames: (v: boolean) => void
  onClose: () => void
}) {
  return (
    <Popover label="Layout" width={352} right={18.2} arrowFromLeft={176} onClose={onClose} padding="px-[8px] py-[12px]">
      <section aria-label="Layout" className="flex h-[133.8px] w-[336px] flex-col">
        <div className="px-[12px] pt-[8px] text-[14px] font-bold leading-[20px]">Layout</div>
        <div className="mt-[12px] flex gap-[4px]" role="radiogroup" aria-label="Layout">
          {OPTIONS.map((o) => {
            const selected = o.id === layout
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onLayout(o.id)}
                className="mb-[8px] box-border flex h-[72.78px] w-[109.33px] flex-col items-center rounded-[8px] py-[10.4px] text-[14px] leading-[20px] hover:bg-[var(--webex-surface)]"
                style={selected ? { color: 'var(--webex-link)', background: '#ffffff33', boxShadow: '0 0 0 2px #64b4fa, 0 0 0 4px #64b4fa4d' } : undefined}
              >
                <Icon name={selected ? o.selectedIcon : o.icon} size={32} />
                {o.label}
              </button>
            )
          })}
        </div>
      </section>
      <section aria-label="Layout options" className="flex h-[108px] flex-col">
        <div className="px-[12px] pt-[8px] text-[14px] font-bold leading-[20px]">Layout options</div>
        <div className="h-[8px]" />
        <button type="button" role="menuitemcheckbox" aria-checked={fullscreen} onClick={() => onFullscreen(!fullscreen)} className="flex h-[36px] w-full items-center justify-between rounded-[8px] px-[12px] py-[8px] text-left hover:bg-[var(--webex-surface)]">
          Full-screen view <Toggle on={fullscreen} />
        </button>
        <button type="button" role="menuitemcheckbox" aria-checked={hideNames} onClick={() => onHideNames(!hideNames)} className="flex h-[36px] w-full items-center justify-between rounded-[8px] px-[12px] py-[8px] text-left hover:bg-[var(--webex-surface)]">
          Automatically hide names <Toggle on={hideNames} />
        </button>
      </section>
    </Popover>
  )
}
