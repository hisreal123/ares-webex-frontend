import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { CircleButton, PillButton } from '@/components/webex/controls'
import { Icon } from '@/components/webex/icon'
import { MediaControls } from '@/components/webex/media-controls'
import { WebexShell } from '@/components/webex/shell'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'
import { APPLICANT_COUNT, HOST_NAME, JOIN_INTERVAL_MS, STATIC_PARTICIPANTS } from './config'
import { LayoutMenu, type LayoutKind } from './menus/layout-menu'
import { AudioMenu } from './menus/audio-menu'
import { TooltipLayer } from '@/components/webex/tooltip-layer'
import { LeaveMenu } from './menus/leave-menu'
import { MoreMenu } from './menus/more-menu'
import { ShareMenu } from './menus/share-menu'
import { TileMenu } from './menus/tile-menu'
import { MeetingInfo } from './menus/meeting-info'
import { NetworkIssuesDialog } from './network-dialog'
import { ReactionLottie } from '@/components/webex/reaction-lottie'
import { ReactionsMenu } from './menus/reactions-menu'
import { VideoMenu, type SelfViewLocation } from './menus/video-menu'
import { ChatPanel } from './panels/chat-panel'
import { ParticipantsPanel } from './panels/participants-panel'

type Participant = { id: string; name: string; videoSrc?: string; local?: boolean; muted: boolean; away?: boolean }

const TILE_ASPECT = 16 / 9
const TOAST_MS = 5000
const GAP = 8 // 4px margin on every side of a tile

type Slot = { x: number; y: number; w: number; h: number }

/** Webex "Equal" layout: the column count that gives the biggest 16:9 tiles; the last row is centred. */
function layoutTiles(count: number, width: number, height: number): Slot[] {
  if (!count || width <= 0 || height <= 0) return []
  let best = { cols: 1, tileW: 0 }
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols)
    const tileW = Math.min(width / cols - GAP, (height / rows - GAP) * TILE_ASPECT)
    if (tileW > best.tileW) best = { cols, tileW }
  }
  const { cols } = best
  const tileW = Math.max(best.tileW, 120)
  const tileH = tileW / TILE_ASPECT
  const rows = Math.ceil(count / cols)
  const top = (height - rows * (tileH + GAP)) / 2
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols)
    const inRow = row === rows - 1 ? count - cols * (rows - 1) : cols
    const left = (width - inRow * (tileW + GAP)) / 2
    return { x: left + (i % cols) * (tileW + GAP) + GAP / 2, y: top + row * (tileH + GAP) + GAP / 2, w: tileW, h: tileH }
  })
}

type LayoutMode = 'grid' | 'stack' | 'side-by-side'

/**
 * Stack and Side by side put one participant on the main stage and the rest in a strip
 * (a row under the stage, or a column beside it). NOTE: sizes here are approximations, not yet measured from Webex.
 */
function layoutWithStage(mode: 'stack' | 'side-by-side', count: number, mainIdx: number, width: number, height: number): Slot[] {
  if (count <= 1) return layoutTiles(count, width, height)
  const others = Array.from({ length: count }, (_, i) => i).filter((i) => i !== mainIdx)
  const slots: Slot[] = new Array(count)
  if (mode === 'stack') {
    // Measured from live Webex (1920x1013, 2 people): strip tile 238x134 at the top, main tile 16:9 starting 154px below the area top.
    const thumbW = 238
    const thumbH = 134
    const mainTop = thumbH + 20
    const availH = height - mainTop
    const mainW = Math.min(width, (availH * 16) / 9)
    const mainH = (mainW * 9) / 16
    slots[mainIdx] = { x: (width - mainW) / 2, y: mainTop, w: mainW, h: mainH }
    const rowW = others.length * thumbW + (others.length - 1) * GAP
    others.forEach((o, i) => (slots[o] = { x: (width - rowW) / 2 + i * (thumbW + GAP), y: 0, w: thumbW, h: thumbH }))
  } else {
    // Measured from live Webex (2 people): main tile 16:9 full height, self thumbnail 261x147 in a right-hand column, vertically centred.
    const thumbW = 261
    const thumbH = 147
    const colGap = 44
    const mainW = Math.min(height * (16 / 9), width - thumbW - 4 - colGap)
    const mainH = (mainW * 9) / 16
    slots[mainIdx] = { x: width - 4 - thumbW - colGap - mainW, y: (height - mainH) / 2, w: mainW, h: mainH }
    const colH = others.length * thumbH + (others.length - 1) * GAP
    others.forEach((o, i) => (slots[o] = { x: width - 4 - thumbW, y: (height - colH) / 2 + i * (thumbH + GAP), w: thumbW, h: thumbH }))
  }
  return slots
}

function Tile({ p, slot, stream, camOn, onMenu }: { p: Participant; slot: Slot; stream: MediaStream | null; camOn: boolean; onMenu: (name: string, anchor: DOMRect) => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (p.local && ref.current) ref.current.srcObject = stream
  }, [p.local, stream, camOn])

  const showLocalVideo = p.local && camOn
  const showRemoteVideo = !p.local && !!p.videoSrc

  return (
    <li
      aria-label={`Video pane of ${p.name}`}
      className="group absolute overflow-hidden rounded-[8px] bg-[var(--webex-tile)]"
      style={{
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        transition: 'left var(--webex-tile-move), top var(--webex-tile-move), width var(--webex-tile-move), height var(--webex-tile-move)',
        animation: 'webex-tile-in 360ms cubic-bezier(0.2, 0, 0, 1) both',
      }}
    >
      {p.away && (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--webex-tile)]" role="status">
          <Icon name="coffee-light" size={Math.min(124, slot.h * 0.234)} />
          <span className="text-[24px] leading-[24px]">Stepped away</span>
        </div>
      )}
      {showLocalVideo && !p.away && <video ref={ref} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />}
      {showRemoteVideo && <video src={p.videoSrc} autoPlay loop muted playsInline className="h-full w-full object-cover" />}
      {!showLocalVideo && !showRemoteVideo && !p.away && (
        <span className="flex h-full w-full items-center justify-center bg-[var(--webex-tile)] px-[16px] text-center font-normal leading-[1.2] text-[var(--webex-text-primary)]" style={{ fontSize: Math.max(14, slot.h * 0.1356) }}>
          {p.name}
        </span>
      )}
      <button
        type="button"
        data-popover-trigger
        aria-label={`More options for ${p.name}`}
        onClick={(e) => onMenu(p.name, e.currentTarget.getBoundingClientRect())}
        className="absolute right-[6px] top-[6px] z-[999] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[var(--webex-outline)] bg-[#0f0f0f] opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Icon name="more-bold" size={16} />
      </button>
      <div className="absolute bottom-[4px] left-[4px] flex h-[24px] items-center gap-[4px] rounded-[4px] px-[4px] text-[14px] leading-[20px]" style={{ background: showLocalVideo || showRemoteVideo ? '#00000080' : undefined }}>
        {p.muted && <Icon name="microphone-muted-bold" size={16} className="text-[var(--webex-muted-red)]" />}
        {(showLocalVideo || showRemoteVideo) && <span>{p.name}</span>}
      </div>
    </li>
  )
}

function Toast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, TOAST_MS)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <section aria-label="In meeting notifications" className="fixed right-[8px] top-[52px] z-[10000] w-[400px]">
      <div role="alert" className="relative flex h-[58px] items-center gap-[12px] overflow-hidden rounded-[8px] bg-[var(--webex-toast-bg)] p-[16px] text-[16px] font-medium leading-[24px]">
        <Icon name="info-circle-filled" size={24} className="text-[var(--webex-link)]" />
        <span className="flex-1">You're now in the meeting</span>
        <button type="button" aria-label="Close notification" onClick={onClose} className="flex h-[20px] w-[20px] items-center justify-center rounded-full">
          <Icon name="cancel-bold" size={16} />
        </button>
        <div
          className="absolute bottom-0 left-0 h-[5px]"
          style={{ background: 'linear-gradient(90deg, #4cd964, #5ac8fa, #007aff, #34aadc, #5856d6)', animation: `webex-toast-timer ${TOAST_MS}ms linear forwards` }}
        />
      </div>
    </section>
  )
}

export function MeetingPage({ title, onLeave, showNetworkIssue = false }: { title: string; onLeave: () => void; showNetworkIssue?: boolean }) {
  const guest = useGuestSession()
  const media = useLocalMedia()
  const [toast, setToast] = useState(true)
  const [barHidden, setBarHidden] = useState(false)
  const [stageId, setStageId] = useState<string | null>(null)
  const [away, setAway] = useState(false)
  const [networkDialog, setNetworkDialog] = useState(showNetworkIssue)
  // The "Participants" label shows for the first moments, then collapses to icon-only buttons (as Webex does).
  const [labelVisible, setLabelVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLabelVisible(false), 15000)
    return () => clearTimeout(t)
  }, [])

  // The host is already in the call when you're admitted; everyone else joins one by one.
  const [remoteCount, setRemoteCount] = useState(JOIN_INTERVAL_MS === 0 ? APPLICANT_COUNT : 1)
  useEffect(() => {
    if (remoteCount >= APPLICANT_COUNT) return
    const t = setTimeout(() => setRemoteCount((c) => c + 1), JOIN_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [remoteCount])

  const participants = useMemo<Participant[]>(
    () => [
      { id: 'me', name: guest.name || 'You', local: true, muted: !media.micOn, away },
      ...STATIC_PARTICIPANTS.slice(0, remoteCount).map((p) => ({ ...p, muted: true })),
    ],
    [guest.name, media.micOn, remoteCount, away],
  )

  type Menu = 'layout' | 'info' | 'audio' | 'video' | 'reactions' | 'leave' | 'more' | 'share' | null
  const [tileMenu, setTileMenu] = useState<{ name: string; anchor: DOMRect } | null>(null)
  const [anchorX, setAnchorX] = useState(0)
  const [selfView, setSelfView] = useState<SelfViewLocation>('with-others')
  const [raised, setRaised] = useState(false)
  const [reaction, setReaction] = useState<{ id: string; key: number } | null>(null)
  const [panel, setPanel] = useState<'participants' | 'chat' | null>(null)
  const [menu, setMenu] = useState<Menu>(null)
  const [layoutKind, setLayoutKind] = useState<LayoutKind>('grid')
  const [fullscreen, setFullscreen] = useState(false)
  const [hideNames, setHideNames] = useState(true)
  const toggleMenu = (m: Exclude<Menu, null>) => setMenu((cur) => (cur === m ? null : m))
  const setFull = (on: boolean) => {
    setFullscreen(on)
    if (on) void document.documentElement.requestFullscreen?.().catch(() => undefined)
    else if (document.fullscreenElement) void document.exitFullscreen?.()
  }

  // Webex's reaction shortcuts: Ctrl+Shift+1..5 send a reaction, Ctrl+Shift+E opens the picker.
  useEffect(() => {
    const keys: Record<string, string> = { Digit1: 'thumb_up', Digit2: 'clap', Digit3: 'haha', Digit4: 'celebrate', Digit5: 'heart' }
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return
      if (keys[e.code]) {
        e.preventDefault()
        setReaction({ id: keys[e.code], key: Date.now() })
      } else if (e.code === 'KeyE') {
        e.preventDefault()
        setAnchorX(1170.4)
        setMenu((m) => (m === 'reactions' ? null : 'reactions'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const areaRef = useRef<HTMLUListElement>(null)
  const [area, setArea] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setArea({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const visibleParticipants = selfView === 'hidden' ? participants.filter((p) => !p.local) : participants
  // Someone on stage turns Grid into a stage + strip view. Otherwise the chosen layout applies.
  const mode: LayoutMode = layoutKind === 'grid' && stageId ? 'stack' : (layoutKind as LayoutMode)
  const stagedIdx = visibleParticipants.findIndex((p) => p.id === stageId)
  const mainIdx = stagedIdx >= 0 ? stagedIdx : Math.max(visibleParticipants.findIndex((p) => !p.local), 0)
  const slots = mode === 'grid' ? layoutTiles(visibleParticipants.length, area.w, area.h) : layoutWithStage(mode, visibleParticipants.length, mainIdx, area.w, area.h)

  const people = participants.map((p, i) => ({ id: p.id, name: p.name, me: p.local, host: i === 1, muted: p.muted, raised: !!p.local && raised }))

  return (
    <WebexShell variant="call" momentum showLogo={false}>
      <div className="flex h-screen flex-col">
        <section aria-label="Meeting header" className="z-[100] my-[10px] flex h-[32px] shrink-0 items-center justify-between px-[8px]">
          <span />
          <h1 className="flex-1 text-center text-[14px] font-normal leading-[20px]">{title}</h1>
          <div className="flex items-center gap-[8px]">
            <CircleButton icon="zoom-in-regular" size={28} iconSize={16} aria-label="Zoom" data-tooltip="Zoom in or out to adjust the number of videos on the screen." data-tooltip-side="below" />
            <PillButton data-popover-trigger height={28} iconSize={16} icon="video-layout-equal-bold" aria-expanded={menu === 'layout'} onClick={() => toggleMenu('layout')}>Layout</PillButton>
            <PillButton data-popover-trigger height={28} iconSize={14} icon="encryption-filled" className="gap-[8px]" aria-expanded={menu === 'info'} onClick={() => toggleMenu('info')}>Meeting info</PillButton>
          </div>
        </section>

        {away && (
          <div role="status" className="mx-[8px] box-border flex h-[56px] shrink-0 items-center rounded-[8px] border border-[var(--webex-link)] bg-[#0a274a] pl-[17px] pr-[15px]">
            <Icon name="coffee-bold" size={20} />
            <span className="ml-[8px] flex-1 text-[14px] font-medium leading-[20px]">You've stepped away from the meeting. You're muted and your video is off.</span>
            <button type="button" onClick={() => setAway(false)} className="h-[32px] w-[150px] rounded-[20px] border border-[var(--webex-outline)] text-[16px] font-medium leading-[24px] hover:bg-[var(--webex-surface)]">Back to meeting</button>
          </div>
        )}

        {/* Grid + right-hand panel. The panel slides in (300ms) and the tiles glide into the space that's left. */}
        <div className={`mb-[-7px] flex min-h-0 flex-1 ${away ? 'mt-[8px]' : ''}`}>
          <ul ref={areaRef} aria-label="Participant videos" className={`relative min-h-0 flex-1 ${panel ? '' : 'mx-[8px]'}`}>
            {visibleParticipants.map((p, i) => slots[i] && <Tile key={p.id} p={p} slot={slots[i]} stream={media.videoStream} camOn={media.camOn} onMenu={(name, anchor) => setTileMenu({ name, anchor })} />)}
          </ul>
          <aside
            aria-hidden={!panel}
            className="shrink-0 overflow-hidden"
            style={{ width: panel ? 400 : 0, transition: 'width 0.3s ease-in-out' }}
          >
            <div className="meeting-panel-container box-border h-full w-[400px] rounded-tl-[12px] p-[12px]" style={{ background: 'linear-gradient(#262626, #0f0f0f)' }}>
              {panel === 'participants' && <ParticipantsPanel people={people} onClose={() => setPanel(null)} onRowMenu={(name, anchor) => setTileMenu({ name, anchor })} />}
              {panel === 'chat' && <ChatPanel meetingTitle={title} onClose={() => setPanel(null)} />}
            </div>
          </aside>
        </div>

        <button
          type="button"
          onClick={() => setBarHidden((v) => !v)}
          className="mx-auto mt-[0px] flex h-[16px] w-[96px] shrink-0 items-center justify-center rounded-t-[16px] bg-[var(--webex-bar-tab)] text-[14px] leading-[16px] text-[#f7f7f7]"
          aria-label={barHidden ? 'Show control bar' : 'Hide control bar'}
        >
          <Icon name={barHidden ? 'arrow-up-bold' : 'arrow-down-bold'} size={14} />
        </button>

        {!barHidden && (
          <section aria-label="Controls" className="mb-[12px] mt-[11px] grid h-[40px] shrink-0 grid-cols-[1fr_auto_1fr] items-center px-[12px]">
            <div className="flex justify-start"><CircleButton icon="closed-captions-bold" aria-label="Show closed captions" data-tooltip="Show closed captions" /></div>
            <div className="flex items-center">
              <MediaControls onAudioOptions={(x) => { setAnchorX(x); toggleMenu('audio') }} onVideoOptions={(x) => { setAnchorX(x); toggleMenu('video') }} />
              {!away && <PillButton data-popover-trigger icon="share-screen-bold" className="mr-[8px]" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('share') }}>Share</PillButton>}
              {!away && <div className="mr-[8px] flex h-[40px] rounded-[20px] border border-[var(--webex-outline)]">
                <button type="button" data-tooltip={raised ? 'Lower hand' : 'Raise hand'} aria-label={raised ? 'Lower hand' : 'Raise hand'} aria-pressed={raised} onClick={() => setRaised((v) => !v)} className="flex h-full w-[40px] items-center justify-center rounded-l-[20px] hover:bg-[var(--webex-surface)]" style={raised ? { background: '#ffffff33' } : undefined}>
                  <Icon name="raise-hand-regular" size={20} />
                </button>
                <button type="button" data-popover-trigger data-tooltip="Reactions (Ctrl + Shift + E)" aria-label="Reactions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('reactions') }} className="flex h-full w-[40px] items-center justify-center rounded-r-[20px] border-l border-[var(--webex-outline)] hover:bg-[var(--webex-surface)]">
                  <Icon name="reactions-bold" size={20} />
                </button>
              </div>}
              <CircleButton icon="more-bold" className={away ? 'ml-[8px]' : ''} aria-label="More" data-tooltip="More" data-popover-trigger onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('more') }} />
              <CircleButton icon="cancel-bold" danger aria-label="Leave meeting" data-tooltip="Leave meeting" data-popover-trigger className="ml-[8px]" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('leave') }} />
            </div>
            <div className="flex items-center justify-end gap-[8px]">
              {!panel && labelVisible ? (
                <PillButton icon="participant-list-regular" aria-label="Open the participants panel" onClick={() => setPanel('participants')}>Participants</PillButton>
              ) : (
                <>
                  <CircleButton
                    icon={panel === 'participants' ? 'participant-list-filled' : 'participant-list-regular'}
                    aria-label={panel === 'participants' ? 'Hide the participants pane' : 'Open the participants panel'}
                    data-tooltip={panel === 'participants' ? 'Hide the participants pane' : 'Open the participants panel'}
                    className={panel === 'participants' ? '!border-transparent bg-[#ffffff33]' : ''}
                    onClick={() => setPanel(panel === 'participants' ? null : 'participants')}
                  />
                  <CircleButton
                    icon={panel === 'chat' ? 'chat-filled' : 'chat-bold'}
                    aria-label={panel === 'chat' ? 'Hide chat' : 'Show chat'}
                    data-tooltip={panel === 'chat' ? 'Hide chat' : 'Show chat'}
                    className={`!border-transparent ${panel === 'chat' ? 'bg-[#ffffff33]' : ''}`}
                    onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
                  />
                </>
              )}
            </div>
          </section>
        )}
      </div>
      {menu === 'layout' && (
        <LayoutMenu layout={layoutKind} onLayout={setLayoutKind} fullscreen={fullscreen} onFullscreen={setFull} hideNames={hideNames} onHideNames={setHideNames} onClose={() => setMenu(null)} />
      )}
      {menu === 'more' && <MoreMenu anchorX={anchorX} away={away} onStepAway={() => { setAway((v) => !v); if (!away) { if (media.micOn) void media.toggleMic(); if (media.camOn) void media.toggleCam() } }} onClose={() => setMenu(null)} />}
      {menu === 'share' && <ShareMenu anchorX={anchorX} onClose={() => setMenu(null)} />}
      {tileMenu && (() => {
        const target = participants.find((p) => p.name === tileMenu.name)
        const onStage = !!target && target.id === stageId
        return <TileMenu name={tileMenu.name} anchor={tileMenu.anchor} onStage={onStage} onToggleStage={() => target && setStageId(onStage ? null : target.id)} onClose={() => setTileMenu(null)} />
      })()}
      <TooltipLayer />
      {menu === 'leave' && <LeaveMenu anchorX={anchorX} onLeave={onLeave} onClose={() => setMenu(null)} />}
      {menu === 'audio' && <AudioMenu anchorX={anchorX} onClose={() => setMenu(null)} />}
      {menu === 'video' && <VideoMenu anchorX={anchorX} selfView={selfView} onSelfView={setSelfView} onClose={() => setMenu(null)} />}
      {menu === 'reactions' && <ReactionsMenu anchorX={anchorX} onPick={(id) => setReaction({ id, key: Date.now() })} onClose={() => setMenu(null)} />}
      {menu === 'info' && <MeetingInfo title={title} hostName={HOST_NAME} onClose={() => setMenu(null)} />}
      {reaction && (
        <div key={reaction.key} aria-hidden className="pointer-events-none fixed z-[1004]" style={{ left: slots[0] ? (panel ? 0 : 8) + slots[0].x + slots[0].w / 2 - 140 : 0, top: slots[0] ? 52 + slots[0].y + slots[0].h / 2 - 140 : 0 }}>
          <ReactionLottie name={`on_video_${reaction.id}`} size={280} autoplay onComplete={() => setReaction(null)} />
        </div>
      )}
      {networkDialog && <NetworkIssuesDialog onClose={() => setNetworkDialog(false)} />}
      {toast && <Toast onClose={() => setToast(false)} />}
    </WebexShell>
  )
}
