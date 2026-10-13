// Static meeting simulation (no backend yet): the guest is alone when admitted and the other
// applicants join one by one.

const int = (raw: unknown, fallback: number, min: number, max: number) => {
  const n = Math.floor(Number(raw))
  return Number.isFinite(n) && String(raw ?? '') !== '' ? Math.min(Math.max(n, min), max) : fallback
}

export type StaticParticipant = { id: string; name: string; videoSrc: string }

/** Everyone who can show up besides you. The first entry is the host. */
export const STATIC_PARTICIPANTS: StaticParticipant[] = [
  { id: 'p1', name: 'Omos George', videoSrc: '/assets/videos/participant-1.mp4' },
  { id: 'p2', name: 'Jonathan Kwok', videoSrc: '/assets/videos/participant-2.mp4' },
  { id: 'p3', name: 'Priya Sharma', videoSrc: '/assets/videos/participant-3.mp4' },
  { id: 'p4', name: 'Jordan Lee', videoSrc: '/assets/videos/participant-4.mp4' },
]

/** VITE_APPLICANT_COUNT: how many other people (static videos) are in the meeting besides you. 1-4, default 2. */
export const APPLICANT_COUNT = int(import.meta.env.VITE_APPLICANT_COUNT, 2, 1, STATIC_PARTICIPANTS.length)

/** VITE_JOIN_INTERVAL_MS: delay between each person joining after you're admitted. 0 = everyone is already there. */
export const JOIN_INTERVAL_MS = int(import.meta.env.VITE_JOIN_INTERVAL_MS, 4000, 0, 60000)

export const HOST_NAME = STATIC_PARTICIPANTS[0].name
export const MEETING_TITLE = 'Welcome space'
export const HOST_STARTED = import.meta.env.VITE_HOST_STARTED !== 'false'

export function meetingTitleForUserCount(userCount: number) {
  return userCount >= 2 ? `${userCount} users` : MEETING_TITLE
}

// Shown in the "Meeting info" popover (static for now).
export const MEETING_NUMBER = '2363 421 2182'
export const VIDEO_SYSTEM_ADDRESS = '23634212182@meet1753742118034-5642.webex.com'
export const MEETING_LINK = 'https://meet1753742118034-5642.webex.com/meet1753742118034-5642/j.php?MTID=m517b36b0cb763fe0b3dd5ed0334551ce'

/** VITE_MEETING_END_MS: the host "ends the meeting" this long after you're admitted. 0 (default) = it never ends on its own. */
export const MEETING_END_MS = int(import.meta.env.VITE_MEETING_END_MS, 0, 0, 24 * 60 * 60 * 1000)
