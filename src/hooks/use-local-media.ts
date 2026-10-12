import { createContext, useContext } from 'react'

import type { BackgroundSelection } from '@/features/pre-join/types'

export type Permission = 'unknown' | 'granted' | 'denied'

export type LocalMedia = {
  micOn: boolean
  camOn: boolean
  micPermission: Permission
  camPermission: Permission
  videoStream: MediaStream | null
  background: BackgroundSelection
  setBackground: (background: BackgroundSelection) => void
  mirror: boolean
  setMirror: (mirror: boolean) => void
  toggleMic: () => Promise<void>
  toggleCam: () => Promise<void>
  /** Ask for both at once (the lobby's "Use microphone and camera"). */
  requestBoth: () => Promise<void>
  /** Start the camera if the browser already granted access (no prompt). */
  ensureCamera: () => Promise<void>
  stopAll: () => void
}

export const LocalMediaContext = createContext<LocalMedia | null>(null)

export function useLocalMedia() {
  const ctx = useContext(LocalMediaContext)
  if (!ctx) throw new Error('useLocalMedia must be used inside <LocalMediaProvider>')
  return ctx
}
