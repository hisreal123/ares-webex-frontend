import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { CircleButton, PillButton } from '@/components/webex/controls'
import { Icon } from '@/components/webex/icon'
import { MediaControls } from '@/components/webex/media-controls'
import { WebexShell } from '@/components/webex/shell'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'
import { VirtualBackgroundVideo } from '@/lib/virtual-background/virtual-background-video'
import { useSpeakingIndicator } from './hooks/use-speaking-indicator'
import { SelfView } from '@/components/webex/self-view'
import { Popover } from './menus/popover'
import { CaptionsDialog } from './captions-dialog'
import { EditNameDialog } from './edit-name-dialog'
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
import { MenuRow, VideoMenu, type SelfViewLocation } from './menus/video-menu'
import { ChatPanel } from './panels/chat-panel'
import { ParticipantsPanel } from './panels/participants-panel'
import { ZoomMenu } from './menus/zoom-menu'

type Participant = { id: string; name: string; videoSrc?: string; local?: boolean; muted: boolean; away?: boolean }

const TILE_ASPECT = 16 / 9
const TOAST_MS = 5000
const GAP = 8 // 4px margin on every side of a tile
const PAGE_SIZES = [1, 2, 4, 6, 9, 12, 16, 20, 25]
const PAGER = 'flex items-center justify-center bg-[#000000f2] text-[var(--webex-text-primary)] outline-none hover:bg-[#1a1a1a] aria-disabled:cursor-default aria-disabled:text-[#ffffff66] aria-disabled:hover:bg-[#000000f2] focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59]'
const SPLIT_DIVIDER = 12
const SPLIT_KEY_STEP = 10
const SPLIT_LIMITS = {
  stack: { initial: 0.165, min: 0.13, max: 0.39 },
  'side-by-side': { initial: 0.143, min: 0.12, max: 0.43 },
} as const
const SPLIT_LABELS = {
  stack: 'Window splitter to resize the film strip above. Press Up Arrow to move the splitter up, press Down Arrow to move it down, press Enter to collapse the film strip and if it is collapsed press Enter again to restore the splitter to its previous position.',
  'side-by-side': 'Window splitter to resize the film strip in the right. Press Right Arrow to move the splitter right, press Left Arrow to move it left, press Enter to collapse the film strip and if it is collapsed press Enter again to restore the splitter to its previous position.',
}
const IDLE_MS = 5000

type Slot = { x: number; y: number; w: number; h: number }

/** Webex "Equal" layout: the column count that gives the biggest 16:9 tiles; the last row is centred. */
function zoomPageSizes(count: number) {
  const fit = PAGE_SIZES.find((size) => size >= count) ?? PAGE_SIZES[PAGE_SIZES.length - 1]
  return PAGE_SIZES.filter((size) => size <= fit).reverse()
}

function layoutTiles(count: number, width: number, height: number): Slot[] {
  if (!count || width <= 0 || height <= 0) return []
  let best = { cols: 1, tileW: 0 }
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols)
    const tileW = Math.min(width / cols - GAP, (height / rows - GAP) * TILE_ASPECT)
    if (tileW > best.tileW) best = { cols, tileW }
  }
  const { cols } = best
  const rows = Math.ceil(count / cols)
  const tileW = Math.max(Math.min(width / cols - GAP, (height / rows - GAP) * TILE_ASPECT), 120)
  const tileH = tileW / TILE_ASPECT
  const top = (height - rows * (tileH + GAP)) / 2
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols)
    const inRow = row === rows - 1 ? count - cols * (rows - 1) : cols
    const left = (width - inRow * (tileW + GAP)) / 2
    return { x: left + (i % cols) * (tileW + GAP) + GAP / 2, y: top + row * (tileH + GAP) + GAP / 2, w: tileW, h: tileH }
  })
}

type LayoutMode = 'grid' | 'stack' | 'side-by-side'
type SplitMode = Exclude<LayoutMode, 'grid'>

function snapSplit(mode: SplitMode, value: number) {
  const { min, max } = SPLIT_LIMITS[mode]
  return value < min ? 0 : Math.min(value, max)
}

/**
 * Stack and Side by side put one participant on the main stage and the rest in a strip
 * (a row above the stage, or a column beside it).
 */
function layoutWithStage(mode: SplitMode, count: number, mainIdx: number, width: number, height: number, split: number = SPLIT_LIMITS[mode].initial): Slot[] {
  if (count <= 1) return layoutTiles(count, width, height)
  const others = Array.from({ length: count }, (_, i) => i).filter((i) => i !== mainIdx)
  const slots: Slot[] = new Array(count)
  if (mode === 'stack') {
    const stripH = Math.round(split * (height - SPLIT_DIVIDER))
    const thumbW = stripH > 0 ? Math.min((stripH - GAP) * TILE_ASPECT, (width - others.length * GAP) / others.length) : 0
    const thumbH = thumbW / TILE_ASPECT
    const rowW = others.length * (thumbW + GAP) - GAP
    others.forEach((o, i) => (slots[o] = { x: (width - rowW) / 2 + i * (thumbW + GAP), y: Math.max(stripH - thumbH, 0) / 2, w: thumbW, h: thumbH }))
    const mainTop = stripH + SPLIT_DIVIDER
    const availH = height - mainTop - GAP
    const mainW = Math.min(width - GAP, availH * TILE_ASPECT)
    const mainH = mainW / TILE_ASPECT
    slots[mainIdx] = { x: (width - mainW) / 2, y: mainTop + GAP / 2 + (availH - mainH) / 2, w: mainW, h: mainH }
  } else {
    const stripW = Math.round(split * (width - SPLIT_DIVIDER))
    const regionW = width - stripW - SPLIT_DIVIDER
    const mainW = Math.min(regionW - GAP, (height - GAP) * TILE_ASPECT)
    const mainH = mainW / TILE_ASPECT
    slots[mainIdx] = { x: (regionW - mainW) / 2, y: (height - mainH) / 2, w: mainW, h: mainH }
    const thumbH = stripW > 0 ? Math.min((stripW - GAP) / TILE_ASPECT, (height - others.length * GAP) / others.length) : 0
    const thumbW = thumbH * TILE_ASPECT
    const colH = others.length * (thumbH + GAP) - GAP
    others.forEach((o, i) => (slots[o] = { x: width - stripW + (stripW - thumbW) / 2, y: (height - colH) / 2 + i * (thumbH + GAP), w: thumbW, h: thumbH }))
  }
  return slots
}

function Tile({ p, slot, stream, camOn, onMenu, dragging, hideNames, onStepAway, onVerify }: { p: Participant; slot: Slot; stream: MediaStream | null; camOn: boolean; onMenu: (name: string, anchor: DOMRect) => void; dragging: boolean; hideNames: boolean; onStepAway: () => void; onVerify: (anchor: DOMRect) => void }) {
  const { background, mirror } = useLocalMedia()
  const speaking = useSpeakingIndicator(!!p.local && !p.muted && !p.away)
  const showLocalVideo = p.local && camOn
  const showRemoteVideo = !p.local && !!p.videoSrc
  const hasVideo = (showLocalVideo || showRemoteVideo) && !p.away
  const nameInLabel = hasVideo || !!p.away
  const nameClass = hideNames ? 'hidden group-hover:flex' : 'flex'

  return (
    <li
      aria-label={`Video pane of ${p.name}`}
      className="group absolute overflow-hidden rounded-[8px] bg-[var(--webex-tile)]"
      style={{
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        transition: dragging ? 'none' : 'left var(--webex-tile-move), top var(--webex-tile-move), width var(--webex-tile-move), height var(--webex-tile-move)',
        animation: 'webex-tile-in 360ms cubic-bezier(0.2, 0, 0, 1) both',
        boxShadow: speaking ? '0 0 0 4px #37aadc59' : undefined,
      }}
    >
      {speaking && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[998] rounded-[8px] p-[2px]"
          style={{ background: 'linear-gradient(160deg, #3ccdcc, #2fa9e0 45%, #3597e8)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
        />
      )}
      {p.away && (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--webex-tile)]" role="status">
          <div className="flex flex-col items-center group-hover:hidden">
            <Icon name="coffee-light" size={Math.min(124, slot.h * 0.234)} />
            <span className="text-[24px] leading-[24px]">Stepped away</span>
          </div>
          <button type="button" onClick={onStepAway} className="hidden h-[32px] items-center rounded-[20px] border border-[var(--webex-outline)] px-[12px] text-[16px] font-medium leading-[24px] hover:bg-[var(--webex-surface)] group-hover:flex">
            Back to meeting
          </button>
        </div>
      )}
      {showLocalVideo && !p.away && <VirtualBackgroundVideo stream={stream} selection={background} blurVariant="standard" mirror={mirror} className="h-full w-full object-contain" />}
      {showRemoteVideo && <video src={p.videoSrc} autoPlay loop muted playsInline className="h-full w-full object-cover" />}
      {!showLocalVideo && !showRemoteVideo && !p.away && (
        <span className="flex h-full w-full items-center justify-center bg-[var(--webex-tile)] px-[16px] text-center font-normal leading-[1.2] text-[var(--webex-text-primary)]" style={{ fontSize: Math.max(14, slot.h * 0.1356) }}>
          {p.name}
        </span>
      )}
      <div className="absolute right-[6px] top-[6px] z-[999] flex gap-[8px] opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100" style={p.away ? { opacity: 1 } : undefined}>
        {p.local && (
          <button
            type="button"
            data-tooltip={p.away ? 'Go back to the meeting' : 'Step away from the meeting'}
            data-tooltip-side="below"
            aria-label={p.away ? 'Go back to the meeting' : 'Step away from the meeting'}
            aria-pressed={!!p.away}
            onClick={onStepAway}
            className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border ${p.away ? 'border-[#64b4fa] bg-transparent text-[#64b4fa]' : 'border-[var(--webex-outline)] bg-[#0f0f0f]'}`}
          >
            <Icon name="coffee-bold" size={16} />
          </button>
        )}
        <button
          type="button"
          data-popover-trigger
          data-tooltip="More"
          data-tooltip-side="below"
          aria-label={`More options for ${p.name}`}
          onClick={(e) => onMenu(p.name, e.currentTarget.getBoundingClientRect())}
          className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[var(--webex-outline)] bg-[#0f0f0f]"
        >
          <Icon name="more-bold" size={16} />
        </button>
      </div>
      <div
        aria-label={[p.muted ? 'Muted' : '', nameInLabel ? p.name : '', p.local ? 'Unverified' : ''].filter(Boolean).join(' ')}
        className={`absolute bottom-[4px] left-[4px] flex h-[24px] items-center rounded-[4px] px-[4px] text-[12px] leading-[16px] ${hasVideo ? 'bg-[#000000b3]' : ''}`}
      >
        <span data-tooltip={p.muted ? 'Muted' : undefined} className="flex h-[24px] w-[16px] items-center justify-center">
          <Icon name={p.muted ? 'microphone-muted-bold' : 'microphone-on-bold'} size={16} className={p.muted ? 'text-[var(--webex-muted-red)]' : 'text-[var(--webex-success)]'} />
        </span>
        {nameInLabel && (
          <span className={`${nameClass} items-center pl-[4px] pr-[0px]`}>
            <span>{p.name}</span>
            {p.local && (
              <>
                <span aria-hidden className="mx-[4px] text-[var(--webex-text-secondary)]">•</span>
                <button
                  type="button"
                  data-popover-trigger
                  aria-label="Show more information"
                  onClick={(e) => onVerify(e.currentTarget.getBoundingClientRect())}
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-[9px] text-[#f2990a]"
                >
                  <Icon name="help-circle-bold" size={12} />
                </button>
                <span className="ml-[2px] leading-[12px] text-[#f2990a]">Unverified</span>
              </>
            )}
          </span>
        )}
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

  // You're alone when admitted; everyone else joins one by one.
  const [remoteCount, setRemoteCount] = useState(JOIN_INTERVAL_MS === 0 ? APPLICANT_COUNT : 0)
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

  type Menu = 'layout' | 'zoom' | 'info' | 'audio' | 'video' | 'reactions' | 'leave' | 'more' | 'share' | null
  const [tileMenu, setTileMenu] = useState<{ name: string; anchor: DOMRect } | null>(null)
  const [verifyAnchor, setVerifyAnchor] = useState<DOMRect | null>(null)
  const [captionsDialog, setCaptionsDialog] = useState(false)
  const [editName, setEditName] = useState(false)
  const [anchorX, setAnchorX] = useState(0)
  const [selfView, setSelfView] = useState<SelfViewLocation>('with-others')
  const [raised, setRaised] = useState(false)
  const [reaction, setReaction] = useState<{ id: string; key: number } | null>(null)
  const [panel, setPanel] = useState<'participants' | 'chat' | null>(null)
  const [menu, setMenu] = useState<Menu>(null)
  const [layoutKind, setLayoutKind] = useState<LayoutKind>('grid')
  const [zoomLevel, setZoomLevel] = useState(0)
  const [page, setPage] = useState(0)
  const [splits, setSplits] = useState<Record<SplitMode, number>>({ stack: SPLIT_LIMITS.stack.initial, 'side-by-side': SPLIT_LIMITS['side-by-side'].initial })
  const splitRestore = useRef<Record<SplitMode, number>>({ ...splits })
  const splitGrab = useRef(0)
  const [splitDrag, setSplitDrag] = useState<SplitMode | null>(null)
  const [splitFocused, setSplitFocused] = useState(false)
  const [pointerIdle, setPointerIdle] = useState(false)
  const setSplit = (m: SplitMode, next: (cur: number) => number) => setSplits((cur) => ({ ...cur, [m]: next(cur[m]) }))
  const [fullscreen, setFullscreen] = useState(false)
  const [hideNames, setHideNames] = useState(true)
  const toggleMenu = (m: Exclude<Menu, null>) => setMenu((cur) => (cur === m ? null : m))
  const setFull = (on: boolean) => {
    setFullscreen(on)
    if (on) void document.documentElement.requestFullscreen?.().catch(() => undefined)
    else if (document.fullscreenElement) void document.exitFullscreen?.()
  }

  const pushToTalk = useRef(false)
  useEffect(() => {
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(t.tagName))
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || typing(e.target) || media.micOn || away) return
      e.preventDefault()
      pushToTalk.current = true
      void media.toggleMic()
    }
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !pushToTalk.current) return
      pushToTalk.current = false
      if (media.micOn) void media.toggleMic()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [media, away])

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
  useEffect(() => {
    if (!splitDrag) return
    const onMove = (event: PointerEvent) => {
      const el = areaRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const next = splitDrag === 'stack'
        ? (event.clientY - rect.top - splitGrab.current) / (rect.height - SPLIT_DIVIDER)
        : (rect.right - event.clientX + splitGrab.current - SPLIT_DIVIDER) / (rect.width - SPLIT_DIVIDER)
      setSplits((cur) => ({ ...cur, [splitDrag]: snapSplit(splitDrag, next) }))
    }
    const onUp = () => setSplitDrag(null)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
    }
  }, [splitDrag])
  useEffect(() => {
    for (const m of ['stack', 'side-by-side'] as const) if (splits[m] > 0) splitRestore.current[m] = splits[m]
  }, [splits])
  useEffect(() => {
    let timer = 0
    const wake = () => {
      setPointerIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setPointerIdle(true), IDLE_MS)
    }
    wake()
    document.addEventListener('pointermove', wake)
    document.addEventListener('keydown', wake)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointermove', wake)
      document.removeEventListener('keydown', wake)
    }
  }, [])
  const visibleParticipants = selfView === 'with-others' ? participants : participants.filter((p) => !p.local)
  const toggleAway = () => {
    setAway((v) => !v)
    if (!away) {
      if (media.micOn) void media.toggleMic()
      if (media.camOn) void media.toggleCam()
    }
  }
  // Someone on stage turns Grid into a stage + strip view. Otherwise the chosen layout applies.
  const mode: LayoutMode = layoutKind === 'grid' && stageId ? 'stack' : (layoutKind as LayoutMode)
  const stagedIdx = visibleParticipants.findIndex((p) => p.id === stageId)
  const mainIdx = stagedIdx >= 0 ? stagedIdx : Math.max(visibleParticipants.findIndex((p) => !p.local), 0)
  const split = mode === 'grid' ? 0 : splits[mode]
  const pageSizes = zoomPageSizes(visibleParticipants.length)
  const maxZoom = mode === 'grid' ? pageSizes.length - 1 : 0
  const zoom = Math.min(zoomLevel, maxZoom)
  const pageSize = pageSizes[zoom] ?? visibleParticipants.length
  const pageCount = mode === 'grid' ? Math.max(1, Math.ceil(visibleParticipants.length / pageSize)) : 1
  const currentPage = Math.min(page, pageCount - 1)
  const pageStart = currentPage * pageSize
  const pageItems = visibleParticipants.slice(pageStart, pageStart + pageSize).length
  const slots: (Slot | undefined)[] = mode === 'grid'
    ? visibleParticipants.map((_, i) => (i >= pageStart && i < pageStart + pageSize ? layoutTiles(pageItems, area.w, area.h)[i - pageStart] : undefined))
    : layoutWithStage(mode, visibleParticipants.length, mainIdx, area.w, area.h, split)

  const splitMode: SplitMode | null = mode !== 'grid' && visibleParticipants.length > 1 && area.w > 0 && area.h > 0 ? mode : null
  const stepSplit = (m: SplitMode, grow: boolean) =>
    setSplit(m, (s) => {
      const step = SPLIT_KEY_STEP / ((m === 'stack' ? area.h : area.w) - SPLIT_DIVIDER)
      if (grow) return s === 0 ? SPLIT_LIMITS[m].min : Math.min(s + step, SPLIT_LIMITS[m].max)
      return snapSplit(m, s - step)
    })

  const people = participants.map((p, i) => ({ id: p.id, name: p.name, me: p.local, host: i === 1, muted: p.muted, raised: !!p.local && raised }))

  return (
    <WebexShell variant="call" momentum showLogo={false}>
      <div className="flex h-screen flex-col">
        <section aria-label="Meeting header" className="z-[100] my-[10px] flex h-[32px] shrink-0 items-center justify-between px-[8px]">
          <span />
          <h1 className="flex-1 text-center text-[14px] font-normal leading-[20px]">{title}</h1>
          <div className="flex items-center gap-[8px]">
            {maxZoom > 0 && <CircleButton
              icon="zoom-in-regular"
              size={28}
              iconSize={16}
              aria-label="Zoom"
              aria-expanded={menu === 'zoom'}
              data-tooltip="Zoom in or out to adjust the number of videos on the screen."
              data-tooltip-side="below"
              data-popover-trigger
              className={menu === 'zoom' ? 'bg-[#ffffff12]' : ''}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                setAnchorX(r.x + r.width / 2)
                toggleMenu('zoom')
              }}
            />}
            <PillButton data-popover-trigger height={28} iconSize={16} icon="video-layout-equal-bold" aria-expanded={menu === 'layout'} onClick={() => toggleMenu('layout')}>Layout</PillButton>
            <PillButton data-popover-trigger height={28} className="gap-[8px]" aria-expanded={menu === 'info'} onClick={() => toggleMenu('info')}><Icon name="encryption-filled" size={14} className="text-[#64b4fa]" />Meeting info</PillButton>
          </div>
        </section>

        {away && (
          <div role="status" className="mx-[8px] box-border flex h-[56px] shrink-0 items-center rounded-[8px] border border-[var(--webex-link)] bg-[#0a274a] pl-[17px] pr-[15px]">
            <Icon name="coffee-bold" size={20} className="text-[#64b4fa]" />
            <span className="ml-[8px] flex-1 text-[14px] font-medium leading-[20px]">You've stepped away from the meeting. You're muted and your video is off.</span>
            <button type="button" onClick={() => setAway(false)} className="h-[32px] w-[150px] rounded-[20px] border border-[var(--webex-outline)] text-[16px] font-medium leading-[24px] hover:bg-[var(--webex-surface)]">Back to meeting</button>
          </div>
        )}

        {/* Grid + right-hand panel. The panel slides in (300ms) and the tiles glide into the space that's left. */}
        <div className={`mb-[-7px] flex min-h-0 flex-1 ${away ? 'mt-[8px]' : ''}`}>
          <ul ref={areaRef} aria-label="Participant videos" className={`relative min-h-0 flex-1 ${panel ? '' : 'mx-[8px]'}`}>
            {visibleParticipants.map((p, i) => slots[i] && <Tile key={p.id} p={p} slot={slots[i]} stream={media.videoStream} camOn={media.camOn} dragging={!!splitDrag} hideNames={hideNames} onStepAway={toggleAway} onVerify={(anchor) => setVerifyAnchor((cur) => (cur ? null : anchor))} onMenu={(name, anchor) => setTileMenu({ name, anchor })} />)}
            {pageCount > 1 && (
              <div className="absolute bottom-[16px] right-[16px] z-[1002] flex flex-col items-center gap-[8px]">
                {currentPage > 0 && (
                  <button type="button" aria-label="Back to top" data-tooltip="Back to top" data-tooltip-side="left" onClick={() => setPage(0)} className={`${PAGER} h-[32px] w-[32px] rounded-full border border-[var(--webex-outline)]`}>
                    <Icon name="upload-bold" size={16} />
                  </button>
                )}
                <div className="flex flex-col gap-px rounded-[20px] border border-[var(--webex-outline)] bg-[#ffffff66]">
                  <button type="button" aria-label={currentPage === 0 ? "You're on the first page" : 'Previous page'} aria-disabled={currentPage === 0} data-tooltip={currentPage === 0 ? "You're on the first page" : 'Previous page'} data-tooltip-side="left" onClick={() => currentPage > 0 && setPage(currentPage - 1)} className={`${PAGER} h-[32px] w-[32px] rounded-t-[20px]`}>
                    <Icon name="arrow-up-bold" size={16} />
                  </button>
                  <button type="button" aria-label={currentPage === pageCount - 1 ? "You're on the last page" : 'Next page'} aria-disabled={currentPage === pageCount - 1} data-tooltip={currentPage === pageCount - 1 ? "You're on the last page" : 'Next page'} data-tooltip-side="left" onClick={() => currentPage < pageCount - 1 && setPage(currentPage + 1)} className={`${PAGER} h-[32px] w-[32px] rounded-b-[20px]`}>
                    <Icon name="arrow-down-bold" size={16} />
                  </button>
                </div>
              </div>
            )}
            {splitMode && (
              <div
                role="separator"
                tabIndex={0}
                aria-orientation={splitMode === 'stack' ? 'horizontal' : 'vertical'}
                aria-valuemin={0}
                aria-valuemax={Math.round(SPLIT_LIMITS[splitMode].max * 100)}
                aria-valuenow={Math.round(split * 100)}
                aria-label={SPLIT_LABELS[splitMode]}
                className={`absolute z-[1002] flex items-center justify-center outline-none ${splitMode === 'stack' ? 'left-0 w-full' : 'top-0 h-full'}`}
                style={{
                  ...(splitMode === 'stack'
                    ? { top: Math.round(split * (area.h - SPLIT_DIVIDER)), height: SPLIT_DIVIDER }
                    : { left: area.w - SPLIT_DIVIDER - Math.round(split * (area.w - SPLIT_DIVIDER)), width: SPLIT_DIVIDER }),
                  touchAction: 'none',
                  cursor: splitMode === 'stack'
                    ? split === 0 ? 's-resize' : split >= SPLIT_LIMITS.stack.max ? 'n-resize' : 'ns-resize'
                    : split === 0 ? 'w-resize' : split >= SPLIT_LIMITS['side-by-side'].max ? 'e-resize' : 'ew-resize',
                  opacity: pointerIdle && !splitDrag && !splitFocused ? 0 : 1,
                  transition: splitDrag ? 'opacity 0.25s linear' : `opacity 0.25s linear, ${splitMode === 'stack' ? 'top' : 'left'} var(--webex-tile-move)`,
                }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  const r = event.currentTarget.getBoundingClientRect()
                  splitGrab.current = splitMode === 'stack' ? event.clientY - r.top : event.clientX - r.left
                  setSplitDrag(splitMode)
                }}
                onFocus={() => setSplitFocused(true)}
                onBlur={() => setSplitFocused(false)}
                onKeyDown={(event) => {
                  const [shrink, grow] = splitMode === 'stack' ? ['ArrowUp', 'ArrowDown'] : ['ArrowRight', 'ArrowLeft']
                  if (event.key === 'Enter') setSplit(splitMode, (s) => (s === 0 ? splitRestore.current[splitMode] : 0))
                  else if (event.key === shrink) stepSplit(splitMode, false)
                  else if (event.key === grow) stepSplit(splitMode, true)
                  else return
                  event.preventDefault()
                }}
              >
                <span className={`pointer-events-none flex select-none items-center justify-center gap-[2px] p-[2px] ${splitMode === 'stack' ? 'h-[8px] w-[28px] flex-col' : 'h-[28px] w-[8px] flex-row'}`}>
                  <span className={`rounded-full bg-[#ffffff66] ${splitMode === 'stack' ? 'h-px w-[24px]' : 'h-[24px] w-px'}`} />
                  <span className={`rounded-full bg-[#ffffff66] ${splitMode === 'stack' ? 'h-px w-[24px]' : 'h-[24px] w-px'}`} />
                </span>
              </div>
            )}
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
          data-tooltip={barHidden ? 'Show control bar' : 'Hide control bar'}
        >
          <Icon name={barHidden ? 'arrow-up-bold' : 'arrow-down-bold'} size={14} />
        </button>

        {!barHidden && (
          <section aria-label="Controls" className="mb-[12px] mt-[11px] grid h-[40px] shrink-0 grid-cols-[1fr_auto_1fr] items-center px-[12px]">
            <div className="flex justify-start"><CircleButton icon="closed-captions-bold" aria-label="Show closed captions" data-tooltip="Show closed captions" onClick={() => setCaptionsDialog(true)} /></div>
            <div className="flex items-center">
              <MediaControls spacebarHint onAudioOptions={(x) => { setAnchorX(x); toggleMenu('audio') }} onVideoOptions={(x) => { setAnchorX(x); toggleMenu('video') }} />
              {!away && <PillButton data-popover-trigger icon="share-screen-bold" className="mr-[8px]" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('share') }}>Share</PillButton>}
              {!away && <div className="mr-[8px] flex h-[40px] rounded-[20px]">
                <button type="button" data-tooltip={raised ? 'Lower hand' : 'Raise hand'} aria-label={raised ? 'Lower hand' : 'Raise hand'} aria-pressed={raised} onClick={() => setRaised((v) => !v)} className="flex h-full w-[40px] items-center justify-center rounded-l-[20px] border border-r-0 border-[var(--webex-outline)] hover:bg-[var(--webex-surface)]" style={raised ? { background: '#ffffff33' } : undefined}>
                  <Icon name="raise-hand-regular" size={20} />
                </button>
                <button type="button" data-popover-trigger data-tooltip="Reactions (Ctrl + Shift + E)" aria-label="Reactions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAnchorX(r.x + r.width / 2); toggleMenu('reactions') }} className="flex h-full w-[40px] items-center justify-center rounded-r-[20px] border border-l-0 border-[var(--webex-outline)] [box-shadow:inset_1px_0_0_var(--webex-outline)] hover:bg-[var(--webex-surface)]">
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
      {menu === 'zoom' && (
        <ZoomMenu anchorX={anchorX} zoom={zoom} maxZoom={maxZoom} onZoom={(z) => { setZoomLevel(z); setPage(0) }} onClose={() => setMenu(null)} />
      )}
      {menu === 'more' && <MoreMenu anchorX={anchorX} away={away} onStepAway={toggleAway} onClose={() => setMenu(null)} />}
      {menu === 'share' && <ShareMenu anchorX={anchorX} onClose={() => setMenu(null)} />}
      {verifyAnchor && (
        <Popover label="Unverified" width={250} left={Math.max(0, verifyAnchor.x + verifyAnchor.width / 2 - 125)} arrowFromLeft={verifyAnchor.x + verifyAnchor.width / 2 - Math.max(0, verifyAnchor.x + verifyAnchor.width / 2 - 125)} side="above" offsetBottom={window.innerHeight - verifyAnchor.top + 15.3} onClose={() => setVerifyAnchor(null)}>
          <p className="text-[12px] leading-[16px]">Webex can't verify {guest.name || 'You'}'s identity because they aren't authenticated or signed in.</p>
        </Popover>
      )}
      {selfView === 'floating' && <SelfView name={guest.name} />}
      {captionsDialog && <CaptionsDialog onClose={() => setCaptionsDialog(false)} />}
      {editName && <EditNameDialog name={guest.name} onSave={(n) => { guest.setName(n); guest.commit() }} onClose={() => setEditName(false)} />}
      {tileMenu && (() => {
        const target = participants.find((p) => p.name === tileMenu.name)
        const onStage = !!target && target.id === stageId
        const toggleStage = () => target && setStageId(onStage ? null : target.id)
        if (target?.local) {
          return (
            <VideoMenu
              beside={{ anchor: tileMenu.anchor, bottomGap: 114 }}
              selfView={selfView}
              onSelfView={setSelfView}
              onClose={() => setTileMenu(null)}
              leading={
                <>
                  <MenuRow icon="pin-bold" autoFocus onClick={() => { toggleStage(); setTileMenu(null) }}>{onStage ? 'Remove from stage' : 'Move to stage'}</MenuRow>
                  <MenuRow icon="mirror-bold" onClick={() => media.setMirror(!media.mirror)}>{media.mirror ? "Don't mirror my video view" : 'Mirror my video view'}</MenuRow>
                  <MenuRow icon="edit-bold" onClick={() => { setTileMenu(null); setEditName(true) }}>Edit display name</MenuRow>
                </>
              }
            />
          )
        }
        return <TileMenu name={tileMenu.name} anchor={tileMenu.anchor} onStage={onStage} onToggleStage={toggleStage} onClose={() => setTileMenu(null)} />
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
