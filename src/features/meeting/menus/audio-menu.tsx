import { useEffect, useState } from 'react'

import { Icon, type IconName } from '@/components/webex/icon'
import { Popover } from './popover'

type Device = { id: string; label: string; sub?: string }
const SPEAKERS: Device[] = [
  { id: 'system', label: 'Follow system setting', sub: 'Default - Computer speakers' },
  { id: 's1', label: 'Computer speakers' },
  { id: 's2', label: 'Headphones' },
]
const MICS: Device[] = [
  { id: 'system', label: 'Follow system setting', sub: 'Default - Computer microphone' },
  { id: 'm1', label: 'Computer microphone' },
  { id: 'm2', label: 'Headset microphone' },
]
const SMART: { id: string; label: string; icon: IconName }[] = [
  { id: 'none', label: 'No optimization', icon: 'sound-default-bold' },
  { id: 'noise', label: 'Noise removal', icon: 'noise-removal-bold' },
  { id: 'music', label: 'Music mode', icon: 'music-mode-circle-bold' },
]

function Option({ label, sub, selected, icon, onClick }: { label: string; sub?: string; selected?: boolean; icon?: IconName; onClick: () => void }) {
  return (
    <button type="button" role="option" aria-selected={selected} onClick={onClick} className={`flex w-full items-center rounded-[8px] px-[12px] py-[8px] text-left hover:bg-[var(--webex-surface)] ${sub ? 'h-[52px]' : 'h-[36px]'}`}>
      {icon && <Icon name={icon} size={16} className="mr-[12px]" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] leading-[20px]">{label}</span>
        {sub && <span className="block truncate text-[12px] leading-[16px] text-[var(--webex-text-secondary)]">{sub}</span>}
      </span>
      {selected && <Icon name="check-bold" size={16} className="ml-[8px]" />}
    </button>
  )
}

function DeviceSection({ icon, title, devices, value, onChange }: { icon: IconName; title: string; devices: Device[]; value: string; onChange: (id: string) => void }) {
  return (
    <section aria-label={title} className="h-[168px] w-[275.8px]">
      <div className="flex h-[36px] items-center px-[12px] pt-[2px]">
        <Icon name={icon} size={16} />
        <span className="ml-[8px] flex-1 text-[14px] font-bold leading-[20px]">{title}</span>
        <button type="button" aria-label={`Test ${title}`} className="h-[24px] rounded-[20px] border border-[var(--webex-outline)] px-[10px] text-[12px] font-medium leading-[16px] hover:bg-[var(--webex-surface)]">Test</button>
      </div>
      <div role="listbox" aria-label={`${title.toLowerCase()} device`} className="-m-[4px] box-border flex flex-col p-[4px]">
        {devices.map((d) => <Option key={d.id} label={d.label} sub={d.sub} selected={value === d.id} onClick={() => onChange(d.id)} />)}
      </div>
    </section>
  )
}

export function AudioMenu({ anchorX, onClose }: { anchorX: number; onClose: () => void }) {
  const [speaker, setSpeaker] = useState('system')
  const [mic, setMic] = useState('system')
  const [smart, setSmart] = useState('noise')
  const [speakers, setSpeakers] = useState(SPEAKERS)
  const [mics, setMics] = useState(MICS)

  // Use the browser's real devices when it will tell us their names.
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.().then((list) => {
      const build = (kind: MediaDeviceKind, fallback: Device[]): Device[] => {
        const devs = list.filter((d) => d.kind === kind && d.label)
        if (!devs.length) return fallback
        const def = devs.find((d) => d.deviceId === 'default') ?? devs[0]
        return [{ id: 'system', label: 'Follow system setting', sub: def.label }, ...devs.filter((d) => d.deviceId !== 'default').map((d) => ({ id: d.deviceId, label: d.label }))]
      }
      setSpeakers(build('audiooutput', SPEAKERS))
      setMics(build('audioinput', MICS))
    }).catch(() => undefined)
  }, [])

  return (
    <Popover label="Audio options" width={301.8} left={anchorX - 150.9} arrowFromLeft={150.9} side="above" onClose={onClose} padding="px-[12px] pb-[12px] pt-[12px]">
      <DeviceSection icon="speaker-bold" title="Speaker" devices={speakers} value={speaker} onChange={setSpeaker} />
      <div className="h-[5px]" />
      <DeviceSection icon="microphone-bold" title="Microphone" devices={mics} value={mic} onChange={setMic} />
      <section aria-label="Smart audio - microphone" className="mt-[13px] w-[275.8px]">
        <div className="flex h-[20px] items-center px-[12px]">
          <Icon name="adjust-microphone-bold" size={16} />
          <span className="ml-[8px] text-[14px] font-bold leading-[20px]">Smart audio - microphone</span>
        </div>
        <div className="mt-[8px]">
          {SMART.map((o) => <Option key={o.id} label={o.label} icon={o.icon} selected={smart === o.id} onClick={() => setSmart(o.id)} />)}
        </div>
      </section>
      <div className="mt-[17px] px-[12px] text-[14px] font-bold leading-[20px]">You're using your computer for audio</div>
      <button type="button" className="mt-[8px] flex h-[32px] w-[275.8px] items-center gap-[6px] rounded-[8px] px-[12px] text-left text-[14px] font-medium leading-[24px] hover:bg-[var(--webex-surface)]">
        <Icon name="join-audio-bold" size={16} /> Switch audio connection
      </button>
    </Popover>
  )
}
