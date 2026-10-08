import { useEffect, useRef } from 'react'

import { Avatar, CircleButton, initialsOf } from '@/components/webex/controls'
import { Icon } from '@/components/webex/icon'
import { MediaControls } from '@/components/webex/media-controls'
import { WebexShell } from '@/components/webex/shell'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'

// Bottom-left preview of the guest's own camera (Webex's "Self-view").
function SelfView({ name }: { name: string }) {
  const media = useLocalMedia()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = media.videoStream
  }, [media.videoStream, media.camOn])

  return (
    <section aria-label="Self-view" className="fixed bottom-[78px] left-[14px] z-[70] flex h-[144px] w-[256px] items-center justify-center overflow-hidden rounded-[8px] bg-[#262626]">
      {media.camOn ? (
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
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
        aria-label={`More options for ${name}`}
        className="absolute right-[6px] top-[6px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#0f0f0f]"
      >
        <Icon name="more-bold" size={16} />
      </button>
    </section>
  )
}

export function LobbyPage({ title, hostName, onLeave }: { title: string; hostName: string; onLeave: () => void }) {
  const guest = useGuestSession()
  const media = useLocalMedia()
  const needsPermission = media.micPermission !== 'granted' || media.camPermission !== 'granted'

  return (
    <WebexShell variant="lobby" momentum showLogo={false}>
      {/* The lit panel is inset 8px and rounded at the top, ending above the control bar. */}
      <div className="absolute inset-x-[8px] top-0 bottom-[72px] rounded-t-[32px]" style={{ background: 'linear-gradient(#262626, #191919)' }} />

      <main className="relative flex min-h-screen flex-col items-center pt-[24vh] text-center">
        {/* The lobby avatar shows the HOST's initials, not the guest's. */}
        <div role="img" aria-label={`Avatar of ${hostName}`}>
          <Avatar initials={initialsOf(hostName)} size={88} fontSize={32} />
        </div>
        <h1 className="mt-[16px] text-[24px] font-medium leading-[32px]">{title}</h1>
        <p className="mt-[16px] text-[14px] leading-[20px]">You're in the meeting lobby. Waiting for the host to let you in.</p>

        {needsPermission && (
          <div className="mt-[24px] flex h-[56px] w-[650px] max-w-full items-center justify-center gap-[12px] rounded-[8px] bg-black px-[16px] text-[14px] leading-[20px]">
            <Icon name="warning-badge-filled" size={20} className="text-[var(--webex-warning)]" />
            <span>Allow Webex to use your microphone and camera.</span>
            <button
              type="button"
              onClick={() => void media.requestBoth()}
              className="h-[32px] rounded-[16px] bg-[var(--webex-primary-blue)] px-[12px] font-medium hover:brightness-110 active:brightness-90"
            >
              Use microphone and camera
            </button>
          </div>
        )}
      </main>

      <SelfView name={guest.name} />

      {/* "Hide control bar" tab + the bar itself. */}
      <div className="fixed bottom-[63px] left-1/2 flex h-[16px] w-[96px] -translate-x-1/2 items-center justify-center rounded-t-[16px] bg-[var(--webex-bar-tab)] text-[14px] leading-[16px] text-[#f7f7f7]">
        <Icon name="arrow-down-bold" size={14} />
      </div>
      <section aria-label="Controls" className="fixed inset-x-0 bottom-[12px] flex h-[40px] items-center justify-center">
        <MediaControls />
        <CircleButton icon="cancel-bold" danger aria-label="Leave meeting" onClick={onLeave} className="ml-[8px]" />
      </section>
    </WebexShell>
  )
}
