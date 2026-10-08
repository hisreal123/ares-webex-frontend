import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { JoinOptionsPage } from '@/features/join-options'
import { LobbyPage } from '@/features/lobby'
import { ConnectingScreen } from '@/features/lobby/connecting'
import { MeetingPage } from '@/features/meeting'
import { MeetingEndedPage } from '@/features/ended'
import { PreJoinPage } from '@/features/pre-join'
import { WebexShell } from '@/components/webex/shell'
import { useGuestSession } from '@/hooks/use-guest-session'
import { useLocalMedia } from '@/hooks/use-local-media'
import { useMeeting } from '@/hooks/use-meeting'

import { HOST_NAME as DEFAULT_HOST, MEETING_END_MS, MEETING_TITLE as DEFAULT_TITLE } from '@/features/meeting/config'
const CONNECTING_MS = 1800
// The host "admits" the guest after this long. 0 keeps them in the lobby forever.
const LOBBY_WAIT_MS = Number(import.meta.env.VITE_LOBBY_WAIT_MS ?? 8000)

function useMeetingRoute() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const [search] = useSearchParams()
  const passcode = search.get('p')
  const meeting = useMeeting(meetingId, passcode)
  const suffix = passcode ? `?p=${encodeURIComponent(passcode)}` : ''
  const base = `/meet/${meetingId ?? ''}`
  return { meetingId, meeting, base, suffix }
}

function MeetingRoute() {
  const navigate = useNavigate()
  const guest = useGuestSession()
  const media = useLocalMedia()
  const { base, suffix, meeting } = useMeetingRoute()
  const [search] = useSearchParams()

  useEffect(() => {
    if (!MEETING_END_MS) return
    const t = setTimeout(() => {
      media.stopAll()
      navigate(`${base}/ended${suffix}`)
    }, MEETING_END_MS)
    return () => clearTimeout(t)
  }, [navigate, base, suffix, media])

  if (meeting.status === 'invalid') return <InvalidMeeting message={meeting.message} />
  if (!guest.name.trim()) return <Navigate to={`${base}/prejoin${suffix}`} replace />
  const data = meeting.status === 'ready' ? meeting.meeting : null
  return (
    <MeetingPage
      title={data?.title || DEFAULT_TITLE}
      showNetworkIssue={search.get('network') === '1'}
      onLeave={() => {
        media.stopAll()
        navigate(`${base}/ended?left=1${suffix ? '&' + suffix.slice(1) : ''}`)
      }}
    />
  )
}

function EndedRoute() {
  const navigate = useNavigate()
  const { base, suffix } = useMeetingRoute()
  const [search] = useSearchParams()
  // NOTE: the wording for a guest who left themselves is not yet confirmed against the real app.
  return <MeetingEndedPage title={DEFAULT_TITLE} message={search.get('left') === '1' ? 'You left the meeting.' : undefined} onDone={() => navigate(`${base}${suffix}`)} />
}

function InvalidMeeting({ message }: { message: string }) {
  // Placeholder until we capture Webex's own "meeting ended / not found" screen.
  return (
    <WebexShell variant="join">
      <main className="mt-[197px] text-center">
        <div className="text-[26px] font-bold leading-[29.9px]">{message}</div>
      </main>
    </WebexShell>
  )
}

function JoinOptionsRoute() {
  const navigate = useNavigate()
  const { base, suffix, meeting } = useMeetingRoute()
  const [search] = useSearchParams()
  if (meeting.status === 'invalid') return <InvalidMeeting message={meeting.message} />
  return <JoinOptionsPage onJoinFromBrowser={() => navigate(`${base}/prejoin${suffix}`)} simulateProblem={search.get('problem') === '1'} />
}

function PreJoinRoute() {
  const navigate = useNavigate()
  const { base, suffix, meeting } = useMeetingRoute()
  if (meeting.status === 'invalid') return <InvalidMeeting message={meeting.message} />
  const title = (meeting.status === 'ready' && meeting.meeting?.title) || DEFAULT_TITLE
  return <PreJoinPage title={title} onJoin={() => navigate(`${base}/lobby${suffix}`)} />
}

function LobbyRoute() {
  const navigate = useNavigate()
  const guest = useGuestSession()
  const media = useLocalMedia()
  const { base, suffix, meeting } = useMeetingRoute()
  const [connecting, setConnecting] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setConnecting(false), CONNECTING_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!LOBBY_WAIT_MS) return
    const t = setTimeout(() => navigate(`${base}/meeting${suffix}`), LOBBY_WAIT_MS)
    return () => clearTimeout(t)
  }, [navigate, base, suffix])

  if (meeting.status === 'invalid') return <InvalidMeeting message={meeting.message} />
  // Landed here directly (refresh or shared URL) without a name: send them back to enter one.
  if (!guest.name.trim()) return <Navigate to={`${base}/prejoin${suffix}`} replace />

  const leave = () => {
    media.stopAll()
    navigate(`${base}${suffix}`)
  }
  if (connecting) return <ConnectingScreen onLeave={leave} />

  const title = (meeting.status === 'ready' && meeting.meeting?.title) || DEFAULT_TITLE
  const hostName = (meeting.status === 'ready' && meeting.meeting?.host_name) || DEFAULT_HOST
  return (
    <LobbyPage
      title={title}
      hostName={hostName}
      onLeave={leave}
    />
  )
}

export function Router() {
  return (
    <Routes>
      <Route path="/meet/:meetingId" element={<JoinOptionsRoute />} />
      <Route path="/meet/:meetingId/prejoin" element={<PreJoinRoute />} />
      <Route path="/meet/:meetingId/lobby" element={<LobbyRoute />} />
      <Route path="/meet/:meetingId/meeting" element={<MeetingRoute />} />
      <Route path="/meet/:meetingId/ended" element={<EndedRoute />} />
      <Route path="*" element={<Navigate to="/meet/demo" replace />} />
    </Routes>
  )
}
