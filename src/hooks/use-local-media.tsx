import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export type Permission = 'unknown' | 'granted' | 'denied'

type LocalMedia = {
  micOn: boolean
  camOn: boolean
  micPermission: Permission
  camPermission: Permission
  videoStream: MediaStream | null
  toggleMic: () => Promise<void>
  toggleCam: () => Promise<void>
  /** Ask for both at once (the lobby's "Use microphone and camera"). */
  requestBoth: () => Promise<void>
  /** Start the camera if the browser already granted access (no prompt). */
  ensureCamera: () => Promise<void>
  stopAll: () => void
}

const Ctx = createContext<LocalMedia | null>(null)

async function queryPermission(name: 'microphone' | 'camera'): Promise<Permission> {
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName })
    return status.state === 'granted' ? 'granted' : status.state === 'denied' ? 'denied' : 'unknown'
  } catch {
    return 'unknown' // Safari/Firefox don't expose these; stay "unknown" until the user acts
  }
}

// Mic and camera state lives above the router so the pre-join choices carry into the lobby.
export function LocalMediaProvider({ children }: { children: ReactNode }) {
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [micPermission, setMicPermission] = useState<Permission>('unknown')
  const [camPermission, setCamPermission] = useState<Permission>('unknown')
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const audioRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    void queryPermission('microphone').then(setMicPermission)
    void queryPermission('camera').then(setCamPermission)
  }, [])

  const stopStream = (s: MediaStream | null) => s?.getTracks().forEach((t) => t.stop())

  const startMic = useCallback(async () => {
    try {
      audioRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicOn(true)
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
    }
  }, [])

  const startCam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setVideoStream(stream)
      setCamOn(true)
      setCamPermission('granted')
    } catch {
      setCamPermission('denied')
    }
  }, [])

  const toggleMic = useCallback(async () => {
    if (micOn) {
      stopStream(audioRef.current)
      audioRef.current = null
      setMicOn(false)
    } else await startMic()
  }, [micOn, startMic])

  const toggleCam = useCallback(async () => {
    if (camOn) {
      stopStream(videoStream)
      setVideoStream(null)
      setCamOn(false)
    } else await startCam()
  }, [camOn, startCam, videoStream])

  const requestBoth = useCallback(async () => {
    await Promise.all([micOn ? null : startMic(), camOn ? null : startCam()])
  }, [camOn, micOn, startCam, startMic])

  const ensureCamera = useCallback(async () => {
    if (camOn) return
    if ((await queryPermission('camera')) === 'granted') await startCam()
  }, [camOn, startCam])

  const stopAll = useCallback(() => {
    stopStream(audioRef.current)
    stopStream(videoStream)
    audioRef.current = null
    setVideoStream(null)
    setMicOn(false)
    setCamOn(false)
  }, [videoStream])

  const value = useMemo(
    () => ({ micOn, camOn, micPermission, camPermission, videoStream, toggleMic, toggleCam, requestBoth, ensureCamera, stopAll }),
    [micOn, camOn, micPermission, camPermission, videoStream, toggleMic, toggleCam, requestBoth, ensureCamera, stopAll],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLocalMedia() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLocalMedia must be used inside <LocalMediaProvider>')
  return ctx
}
