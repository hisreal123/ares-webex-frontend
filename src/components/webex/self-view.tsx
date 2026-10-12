import { useState } from 'react'

import { Avatar } from '@/components/webex/controls'
import { Icon } from '@/components/webex/icon'
import { MenuRow, VideoMenu } from '@/features/meeting/menus/video-menu'
import { useLocalMedia } from '@/hooks/use-local-media'
import { initialsOf } from '@/lib/initials'
import { VirtualBackgroundVideo } from '@/lib/virtual-background/virtual-background-video'

// Bottom-left preview of the guest's own camera (Webex's "Self-view").
export function SelfView({ name }: { name: string }) {
  const media = useLocalMedia()
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)
  const settings = media.videoStream?.getVideoTracks()[0]?.getSettings()
  const height = media.camOn && settings?.width && settings.height ? (256 * settings.height) / settings.width : 144
  return (
    <section aria-label="Self-view" className="fixed bottom-[78px] left-[14px] z-[70] flex w-[256px] items-center justify-center rounded-[8px] bg-[#262626]" style={{ height }}>
      {media.camOn ? (
        <VirtualBackgroundVideo stream={media.videoStream} selection={media.background} blurVariant="standard" mirror={media.mirror} className="h-full w-full rounded-[8px] bg-[#262626] object-contain" />
      ) : media.camPermission === 'denied' ? (
        <div className="flex flex-col items-center gap-[8px] text-[14px] leading-[20px] text-[var(--webex-muted-red)]">
          <Icon name="camera-muted-bold" size={28} />
          Can't access camera
        </div>
      ) : (
        <Avatar initials={initialsOf(name)} size={64} />
      )}
      <button
        type="button"
        data-popover-trigger
        data-tooltip="More"
        data-tooltip-side="below"
        aria-label={`More options for ${name}`}
        aria-expanded={!!menuAnchor}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setMenuAnchor((cur) => (cur ? null : rect))
        }}
        className="absolute right-[6px] top-[6px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[var(--webex-outline)] bg-[#0f0f0f]"
      >
        <Icon name="more-bold" size={16} />
      </button>
      {menuAnchor && <VideoMenu beside={{ anchor: menuAnchor, bottomGap: 84 }} leading={<MenuRow icon="mirror-bold" onClick={() => media.setMirror(!media.mirror)}>{media.mirror ? "Don't mirror my video view" : 'Mirror my video view'}</MenuRow>} onClose={() => setMenuAnchor(null)} />}
    </section>
  )
}
