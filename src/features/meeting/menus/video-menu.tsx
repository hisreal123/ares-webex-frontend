import { useEffect, useState } from 'react'

import { Icon, type IconName } from '@/components/webex/icon'
import { Popover } from './popover'

export type SelfViewLocation = 'with-others' | 'floating' | 'hidden'

const B = '/assets/backgrounds-webex/'
const BACKGROUNDS: { id: string; label: string; icon?: IconName; img?: string }[] = [
  { id: 'none', label: 'None', icon: 'blocked-bold' },
  { id: 'blur', label: 'Blur', icon: 'video-blur-bold' },
  { id: 'boardroom', label: 'Collected Boardroom', img: B + 'boardroom-collected-thumbnail.png' },
  { id: 'serene', label: 'Serene Home Office', img: B + 'home-office-serene-thumbnail.png' },
  { id: 'studio', label: 'Vibrant Studio', img: B + 'studio-vibrant-thumbnail.png' },
  { id: 'common', label: 'Radiant Common Room', img: B + 'common-room-radiant-thumbnail.png' },
  { id: 'quiet', label: 'Quiet Common Room', img: B + 'common-room-quiet-thumbnail.png' },
  { id: 'lively', label: 'Lively Open Space', img: B + 'open-space-lively-thumbnail.png' },
  { id: 'daylight', label: 'Daylight', img: B + 'daylight-thumbnail.png' },
  { id: 'home', label: 'Home Office', img: B + 'home_office-thumbnail.jpg' },
  { id: 'lookout', label: 'Lookout', img: B + 'lookout-thumbnail.png' },
]

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

export function VideoMenu({ anchorX, selfView, onSelfView, onClose }: { anchorX: number; selfView: SelfViewLocation; onSelfView: (v: SelfViewLocation) => void; onClose: () => void }) {
  const [camera, setCamera] = useState('Default camera')
  const [cameras, setCameras] = useState<string[]>(['Default camera'])
  const [bg, setBg] = useState('none')
  const [res, setRes] = useState('720p')

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
    <Popover label="Video options" width={352} left={anchorX - 331} arrowFromLeft={331} side="above" onClose={onClose} padding="px-[8px] py-[12px]">
      <section aria-label="Camera" className="w-[334px] pb-[9px]">
        <SectionTitle icon="camera-bold">Camera</SectionTitle>
        <div className="mt-[8px]">
          {cameras.map((c) => <Row key={c} label={c} selected={camera === c} onClick={() => setCamera(c)} />)}
        </div>
      </section>
      <section aria-label="Virtual background" className="w-[334px] pb-[8px]">
        <SectionTitle icon="video-effect-bold">Virtual background</SectionTitle>
        <div className="mt-[12px] grid grid-cols-[repeat(4,76px)] gap-x-[2px] gap-y-[2px] px-[4px]" role="radiogroup" aria-label="Virtual background">
          {BACKGROUNDS.map((b) => {
            const selected = bg === b.id
            return (
              <button key={b.id} type="button" role="menuitemradio" aria-checked={selected} aria-label={b.label} onClick={() => setBg(b.id)} className="h-[48px] w-[76px] rounded-[8px] p-[4px] hover:bg-[var(--webex-surface)]">
                <span className="box-border block h-[40px] w-[68px] rounded-[6px] p-[2px]" style={selected ? { boxShadow: '0 0 0 2px #64b4fa' } : undefined}>
                  {b.img ? (
                    <img src={b.img} alt="" className="h-[36px] w-[64px] rounded-[4px] object-cover" />
                  ) : (
                    <span className="flex h-[36px] w-[64px] flex-col items-center justify-center rounded-[4px] bg-[#ffffff33]">
                      <Icon name={b.icon!} size={16} />
                      <span className="text-[12px] leading-[16px]">{b.label}</span>
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <div className="mb-[4px] h-px w-[334px] bg-[#ffffff33]" />
      <section aria-label="Preferred camera resolution" className="w-[334px] pb-[4px]">
        <SectionTitle icon="adjust-video-bold">Preferred camera resolution</SectionTitle>
        <div className="mt-[8px]">{['360p', '720p', '1080p'].map((r) => <Row key={r} label={r} selected={res === r} onClick={() => setRes(r)} />)}</div>
      </section>
      <div className="mb-[4px] h-px w-[334px] bg-[#ffffff33]" />
      <section aria-label="Self view location" className="w-[334px]">
        <SectionTitle icon="participant-light">Self view location</SectionTitle>
        <div className="mt-[8px]">
          <Row label="Show with others" selected={selfView === 'with-others'} onClick={() => onSelfView('with-others')} />
          <Row label="Show floating over others" selected={selfView === 'floating'} onClick={() => onSelfView('floating')} />
          <Row label="Hide" selected={selfView === 'hidden'} onClick={() => onSelfView('hidden')} />
        </div>
      </section>
    </Popover>
  )
}
