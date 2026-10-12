import { useEffect, useState } from 'react'

import type { Meeting } from '@/features/pre-join/types'

type State =
  | { status: 'loading' }
  | { status: 'ready'; meeting: Meeting | null } // null: backend unreachable, UI falls back to defaults
  | { status: 'invalid'; message: string }

/** Looks the meeting up in the Ares backend (same endpoint the Teams clone uses). */
export function useMeeting(meetingId: string | undefined, passcode: string | null): State {
  const [state, setState] = useState<State>({ status: 'loading' })
  const api = import.meta.env.VITE_API_URL
  // Static mode (default): no backend calls. Set VITE_USE_BACKEND=true later to look meetings up.
  const offline = import.meta.env.VITE_USE_BACKEND !== 'true' || !meetingId || !api

  useEffect(() => {
    if (offline) return
    const controller = new AbortController()
    const params = new URLSearchParams({ meeting_id: meetingId })
    if (passcode) params.set('passcode', passcode)

    fetch(`${api}/api/meetings/join?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { meeting: Meeting }
          setState({ status: 'ready', meeting: data.meeting })
        } else {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          setState({ status: 'invalid', message: data.error ?? 'This meeting is not available.' })
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        console.warn('Meeting lookup failed, continuing with defaults:', err)
        setState({ status: 'ready', meeting: null })
      })

    return () => controller.abort()
  }, [offline, api, meetingId, passcode])

  return offline ? { status: 'ready', meeting: null } : state
}
