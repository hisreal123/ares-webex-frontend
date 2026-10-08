import { useEffect, useRef, useState } from 'react'

import { CookieBanner } from '@/components/webex/cookie-banner'
import { Avatar, initialsOf, LinkButton, PositiveButton } from '@/components/webex/controls'
import { MediaControls } from '@/components/webex/media-controls'
import { Icon } from '@/components/webex/icon'
import { WebexShell } from '@/components/webex/shell'
import { PermissionDialog } from './permission-dialog'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'

const PREVIEW_LOADING_MS = 1000

function Spinner({ size = 20, accent = false }: { size?: number; accent?: boolean }) {
  return (
    <span
      role="progressbar"
      aria-label="Loading"
      className="block rounded-full border-2 border-transparent"
      style={{
        width: size,
        height: size,
        borderBottomColor: accent ? 'var(--webex-spinner)' : '#ffffffb3',
        borderLeftColor: accent ? 'var(--webex-spinner)' : '#ffffffb3',
        borderRightColor: accent ? 'var(--webex-spinner)' : '#ffffffb3',
        animation: 'webex-spin 0.9s linear infinite',
      }}
    />
  )
}

function NameField({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <div className="min-h-[67.4px] w-full">
      <label htmlFor="webex-name" className="flex gap-[8px] text-[14px] font-medium leading-[20px]">
        Name <span className="text-[var(--webex-required)]" aria-hidden>*</span>
      </label>
      <div className="mt-[8px] flex h-[32px] items-center rounded-[8px] border border-[var(--webex-outline)] py-[5.5px] pl-[12px] pr-[6px] transition-shadow focus-within:border-[#ffffffe6] focus-within:[box-shadow:var(--webex-focus-ring)]">
        <input
          id="webex-name"
          ref={ref}
          type="text"
          required
          maxLength={128}
          autoComplete="name"
          autoCapitalize="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="h-[20px] min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] text-[var(--webex-text-primary)] outline-none"
        />
        {value && (
          <button type="button" aria-label="Clear" onClick={() => onChange('')} className="ml-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-full border border-transparent p-px hover:bg-[var(--webex-surface)]">
            <Icon name="cancel-bold" size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function RememberMe({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-[8px] flex h-[20px] cursor-pointer items-start gap-[8px] text-[14px] leading-[20px]">
      <span
        className="relative mt-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-[2px] border border-transparent"
        style={{ background: checked ? 'var(--webex-link)' : 'transparent', borderColor: checked ? 'transparent' : 'var(--webex-outline)' }}
      >
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="absolute inset-0 m-0 cursor-pointer opacity-0" />
        {checked && <Icon name="check-bold" size={14} />}
      </span>
      Remember me
    </label>
  )
}

/** How long the dim overlay + spinner shows after "Join meeting" before moving on (Webex: until the call connects). */
const JOIN_OVERLAY_MS = 1400

export function PreJoinPage({ title, onJoin }: { title: string; onJoin: () => void }) {
  const guest = useGuestSession()
  const media = useLocalMedia()
  const [previewReady, setPreviewReady] = useState(false)
  const [mirror, setMirror] = useState(true)
  const [joining, setJoining] = useState(false)
  const [dialogStep, setDialogStep] = useState<1 | 2 | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPreviewReady(true), PREVIEW_LOADING_MS)
    return () => clearTimeout(t)
  }, [])

  // Webex asks for mic + camera as soon as the preview is up, unless the browser already allowed both.
  const askedRef = useRef(false)
  useEffect(() => {
    if (!previewReady || askedRef.current) return
    askedRef.current = true
    if (media.micPermission !== 'granted' || media.camPermission !== 'granted') setDialogStep(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewReady])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = media.videoStream
  }, [media.videoStream, previewReady])

  useEffect(() => {
    // Webex starts the camera by itself once the browser has already granted access.
    void media.ensureCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // With no camera access and no name yet, the preview explains what's missing instead of showing an avatar.
  const showPermissionPrompt = !media.camOn && media.camPermission !== 'granted' && !guest.name.trim()

  const canJoin = guest.name.trim().length > 0 && !joining
  const join = () => {
    if (!canJoin) return
    guest.commit()
    setJoining(true)
    setTimeout(onJoin, JOIN_OVERLAY_MS)
  }

  return (
    <>
      <WebexShell
        variant="prejoin"
        momentum
        footer={
          <div className="absolute inset-x-0 bottom-0 flex h-[44px] items-end justify-center p-[12px] text-[12px] leading-[16px] text-[var(--webex-text-secondary)]">
            <span>
              By using Webex, you accept the{' '}
              <a href="#" className="inline-flex items-center gap-[2px] text-[var(--webex-link)] underline">Terms of Service <Icon name="pop-out-regular" size={14} /></a>,{' '}
              <a href="#" className="inline-flex items-center gap-[2px] text-[var(--webex-link)] underline">Privacy Statement <Icon name="pop-out-regular" size={14} /></a>.
            </span>
            <span className="mx-[8px] h-[16px] w-px bg-[var(--webex-disabled-bg)]" />
            <a href="#" className="text-[var(--webex-link)] underline">Report an issue</a>
          </div>
        }
      >
        <div className="mx-auto flex min-h-[calc(100vh-44px)] w-[1030px] max-w-full items-center justify-start py-[40px]">
          {/* Left: title, preview, controls */}
          <section className="w-[704px] shrink-0">
            <header className="mb-[-8px] mt-[32px] px-[24px] text-[24px] font-medium leading-[32px]">{title}</header>

            <div className="flex h-[410px] items-center justify-center p-[16px]">
              <div className="relative flex h-[378px] w-[672px] items-center justify-center overflow-hidden rounded-[8px] border border-[#ffffff1a] bg-[var(--webex-surface)]">
                {!previewReady ? (
                  <Spinner />
                ) : media.camOn ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full rounded-[8px] object-cover ${mirror ? '-scale-x-100' : ''}`} />
                    <button type="button" aria-label={mirror ? "Don't mirror my video" : 'Mirror my video'} onClick={() => setMirror((m) => !m)} className="absolute right-[10px] top-[10px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#000000f2]">
                      <Icon name="mirror-bold" size={16} />
                    </button>
                    <span className="absolute bottom-[8px] left-[8px] rounded-[4px] bg-[#00000080] px-[8px] py-[2px] text-[14px] font-medium leading-[20px]">Preview</span>
                    <button type="button" className="absolute bottom-[8px] right-[8px] flex h-[32px] items-center gap-[6px] rounded-[20px] bg-[#000000f2] px-[12px] text-[16px] font-medium leading-[24px]">
                      <Icon name="video-effect-bold" size={16} /> Backgrounds
                    </button>
                  </>
                ) : showPermissionPrompt ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-[8px]">
                      <Icon name="warning-bold" size={24} className="text-[var(--webex-warning)]" />
                      <span className="text-[20px] font-medium leading-[28px]">Allow Webex to use your microphone and camera.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void media.requestBoth()}
                      style={{ fontFamily: 'var(--webex-font-native-control)' }}
                      className="mt-[14px] h-[32px] rounded-[18.4px] bg-[var(--webex-primary-blue)] px-[12px] text-[16px] font-normal leading-[32px] text-[#f3f8fd] hover:brightness-110 active:brightness-90"
                    >
                      Use microphone and camera
                    </button>
                  </div>
                ) : (
                  <Avatar initials={initialsOf(guest.name)} />
                )}
              </div>
            </div>

            <div className="flex h-[40px] pl-[24px]">
              <MediaControls />
            </div>
          </section>

          {/* Right: name form */}
          <div className="ml-[24px] w-[278px] shrink-0">
            <h2 className="mb-[24px] text-[20px] font-medium leading-[28px]">Enter your name and join</h2>
            <NameField value={guest.name} onChange={guest.setName} onSubmit={join} />
            <RememberMe checked={guest.remember} onChange={guest.setRemember} />
            <PositiveButton disabled={!canJoin} onClick={join} aria-label={`Join meeting ${title}`}>
              {joining ? <Spinner size={24} /> : 'Join meeting'}
            </PositiveButton>
            <hr className="mt-[32px] h-px border-0 bg-[var(--webex-disabled-bg)]" />
            <p className="mt-[24px] text-[16px] leading-[24px] text-[var(--webex-text-secondary)]">
              If you're the host or have a Webex account, <LinkButton>sign in</LinkButton>.
            </p>
          </div>
        </div>
      </WebexShell>
      {dialogStep && !joining && (
        <PermissionDialog
          step={dialogStep}
          onUse={async () => {
            if (dialogStep === 1) await media.requestBoth()
            else await media.toggleMic()
            setDialogStep(null)
          }}
          onSkip={() => setDialogStep(dialogStep === 1 ? 2 : null)}
        />
      )}
      {joining && (
        <div role="alert" aria-busy="true" aria-label="Joining the meeting" className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--webex-overlay)]">
          <Spinner size={40} accent />
        </div>
      )}
      <CookieBanner surface="app" />
    </>
  )
}

export { PreJoinPage as default }
