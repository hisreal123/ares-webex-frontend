import { useState } from 'react'

import { Avatar, CircleButton } from '@/components/webex/controls'
import { initialsOf } from '@/lib/initials'
import { Icon } from '@/components/webex/icon'
import { MediaControls } from '@/components/webex/media-controls'
import { WebexShell } from '@/components/webex/shell'
import { TooltipLayer } from '@/components/webex/tooltip-layer'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'
import { SelfView } from '@/components/webex/self-view'
import { HOST_STARTED } from '@/features/meeting/config'

export function LobbyPage({ title, hostName, onLeave }: { title: string; hostName: string; onLeave: () => void }) {
  const guest = useGuestSession()
  const media = useLocalMedia()
  const needsPermission = media.micPermission !== 'granted' || media.camPermission !== 'granted'
  const [hostNotified, setHostNotified] = useState(false)

  return (
    <WebexShell variant="lobby" momentum showLogo={false}>
      {/* The lit panel is inset 8px, ending above the control bar. */}
      <div className="absolute inset-x-[8px] top-0 bottom-[72px]" style={{ background: 'linear-gradient(#262626, #0f0f0f)' }} />

      <main className="relative flex min-h-screen flex-col items-center pt-[calc(30vh-61.6px)] text-center">
        {/* The lobby avatar shows the HOST's initials, not the guest's. */}
        <div role="img" aria-label={`Avatar of ${hostName}`}>
          <Avatar initials={initialsOf(hostName)} size={88} fontSize={32} />
        </div>
        <h1 className="mt-[16px] text-[24px] font-medium leading-[32px]">{title}</h1>
        <p className="mt-[16px] text-[14px] leading-[20px]">You're in the meeting lobby. Waiting for the host to {HOST_STARTED ? 'let you in' : 'start'}.</p>
        {!HOST_STARTED && !hostNotified && (
          <button
            type="button"
            onClick={() => setHostNotified(true)}
            className="mt-[64px] h-[32px] w-[200px] rounded-[20px] border border-transparent bg-[#fffffff2] px-[12px] text-[16px] font-medium leading-[24px] text-[#000000f2] outline-none hover:bg-[#ffffffcc] focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59] active:bg-[#ffffffb3]"
          >
            Notify host
          </button>
        )}
        {!HOST_STARTED && hostNotified && (
          <div role="status" className="mt-[16px] inline-flex h-[28px] items-center gap-[8px] rounded-[16px] bg-[#0e2b20] px-[8px] text-[14px] font-medium leading-[20px] text-[#3cc29a]">
            <Icon name="check-circle-badge-filled" size={19.2} />
            We've let the host know you are here via email.
          </div>
        )}

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

      <section aria-label="Controls" className="fixed inset-x-0 bottom-[12px] flex h-[40px] items-center justify-center">
        <MediaControls spacebarHint />
        <CircleButton icon="cancel-bold" danger aria-label="Leave meeting" data-tooltip="Leave meeting" onClick={onLeave} className="ml-[8px]" />
      </section>
      <TooltipLayer />
    </WebexShell>
  )
}
