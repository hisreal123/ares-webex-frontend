import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { BackgroundGrid } from '@/components/webex/background-grid'
import { Icon, type IconName } from '@/components/webex/icon'
import { useLocalMedia } from '@/hooks/use-local-media'
import { Popover } from './popover'

export type SelfViewLocation = 'with-others' | 'floating' | 'hidden'

function Row({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className="flex h-[36px] w-[334px] items-center rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] hover:bg-[var(--webex-surface)]"
    >
      <span className="flex-1">{label}</span>
      {selected && <Icon name="check-bold" size={16} />}
    </button>
  )
}

function SectionTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <div className="flex h-[28px] items-center px-[12px] pt-[8px]">
      <Icon name={icon} size={16} />
      <span className="ml-[8px] text-[14px] font-bold leading-[20px]">{children}</span>
    </div>
  )
}

export function MenuRow({ icon, children, onClick, autoFocus }: { icon: IconName; children: ReactNode; onClick: () => void; autoFocus?: boolean }) {
  return (
    <button type="button" role="menuitem" autoFocus={autoFocus} onClick={onClick} className="flex h-[36px] w-[334px] items-center gap-[12px] rounded-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] outline-none hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:0_0_0_2px_#64b4fa,0_0_0_4px_#64b4fa4d]">
      <Icon name={icon} size={16} />
      {children}
    </button>
  )
}

export function VideoMenu({ anchorX = 0, beside, leading, selfView, onSelfView, onClose }: { anchorX?: number; beside?: { anchor: DOMRect; bottomGap: number }; leading?: ReactNode; selfView?: SelfViewLocation; onSelfView?: (v: SelfViewLocation) => void; onClose: () => void }) {
  const [camera, setCamera] = useState('Default camera')
  const [cameras, setCameras] = useState<string[]>(['Default camera'])
  const media = useLocalMedia()
  const [res, setRes] = useState('720p')
  const bodyRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(497)
  useLayoutEffect(() => {
    const dialog = bodyRef.current?.closest('[role=dialog]') as HTMLElement | null
    if (dialog) setHeight(dialog.offsetHeight)
  }, [])
  const anchor = beside?.anchor
  const center = anchor ? anchor.y + anchor.height / 2 : 0
  const top = Math.max(64, Math.min(center - 31, window.innerHeight - (beside?.bottomGap ?? 84) - height))
  const right = anchor ? anchor.right + 15.3 + 352 <= window.innerWidth - 8 : true

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.().then((list) => {
      const cams = list.filter((d) => d.kind === 'videoinput').map((d) => d.label || 'Default camera')
      if (cams.length) {
        setCameras(cams)
        setCamera(cams[0])
      }
    }).catch(() => undefined)
  }, [])

  return (
    <Popover
      label="Video options"
      width={352}
      padding="px-[8px] py-[12px]"
      onClose={onClose}
      {...(anchor ? { side: right ? ('right' as const) : ('left' as const), left: right ? anchor.right + 15.3 : anchor.x - 15.3 - 352, top, arrowFromTop: center - top } : { side: 'above' as const, left: anchorX - 331, arrowFromLeft: 331 })}
    >
      <div ref={bodyRef} />
      {leading && (
        <>
          {leading}
          <div className="my-[4px] h-px w-[334px] bg-[#ffffff33]" />
        </>
      )}
      <section aria-label="Camera" className="w-[334px] pb-[4px]">
        <SectionTitle icon="camera-bold">Camera</SectionTitle>
        <div className="mt-[8px]">
          {cameras.map((c) => <Row key={c} label={c} selected={camera === c} onClick={() => setCamera(c)} />)}
        </div>
      </section>
      <div className="mb-[4px] h-px w-[334px] bg-[#ffffff33]" />
      <section aria-label="Virtual background" className="w-[334px] pb-[4px]">
        <SectionTitle icon="magic-pen-bold">Virtual background</SectionTitle>
        <BackgroundGrid value={media.background} onChange={media.setBackground} className="mt-[8px]" />
      </section>
      <div className="mb-[4px] h-px w-[334px] bg-[#ffffff33]" />
      <section aria-label="Preferred camera resolution" className={`w-[334px] ${selfView && onSelfView ? 'pb-[4px]' : ''}`}>
        <SectionTitle icon="adjust-video-bold">Preferred camera resolution</SectionTitle>
        <div className="mt-[8px]">{['360p', '720p', '1080p'].map((r) => <Row key={r} label={r} selected={res === r} onClick={() => setRes(r)} />)}</div>
      </section>
      {selfView && onSelfView && <div className="mb-[4px] h-px w-[334px] bg-[#ffffff33]" />}
      {selfView && onSelfView && <section aria-label="Self view location" className="w-[334px]">
        <SectionTitle icon="participant-light">Self view location</SectionTitle>
        <div className="mt-[8px]">
          <Row label="Show with others" selected={selfView === 'with-others'} onClick={() => onSelfView('with-others')} />
          <Row label="Show floating over others" selected={selfView === 'floating'} onClick={() => onSelfView('floating')} />
          <Row label="Hide" selected={selfView === 'hidden'} onClick={() => onSelfView('hidden')} />
        </div>
      </section>}
    </Popover>
  )
}
