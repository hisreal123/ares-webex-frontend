import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import type { BackgroundSelection } from '@/features/pre-join/types'

import { LocalMediaContext, type Permission } from './use-local-media'

async function queryPermission(name: 'microphone' | 'camera'): Promise<Permission> {
  const state = await navigator.permissions
    ?.query({ name: name as PermissionName })
    .then((status) => status.state, () => 'prompt' as const)
  if (state === 'granted' || state === 'denied') return state
  const kind = name === 'microphone' ? 'audioinput' : 'videoinput'
  const devices = await navigator.mediaDevices?.enumerateDevices().catch(() => [] as MediaDeviceInfo[])
  return devices?.some((d) => d.kind === kind && d.label) ? 'granted' : 'unknown'
}

// Mic and camera state lives above the router so the pre-join choices carry into the lobby.
export function LocalMediaProvider({ children }: { children: ReactNode }) {
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [micPermission, setMicPermission] = useState<Permission>('unknown')
  const [camPermission, setCamPermission] = useState<Permission>('unknown')
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [background, setBackground] = useState<BackgroundSelection>('none')
  const [mirror, setMirror] = useState(true)
  const audioRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const sync = () => {
      void queryPermission('microphone').then(setMicPermission)
      void queryPermission('camera').then(setCamPermission)
    }
    sync()
    const statuses: PermissionStatus[] = []
    for (const name of ['microphone', 'camera']) {
      navigator.permissions
        ?.query({ name: name as PermissionName })
        .then((status) => {
          status.addEventListener('change', sync)
          statuses.push(status)
        })
        .catch(() => undefined)
    }
    navigator.mediaDevices?.addEventListener('devicechange', sync)
    return () => {
      statuses.forEach((status) => status.removeEventListener('change', sync))
      navigator.mediaDevices?.removeEventListener('devicechange', sync)
    }
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
    () => ({ micOn, camOn, micPermission, camPermission, videoStream, background, setBackground, mirror, setMirror, toggleMic, toggleCam, requestBoth, ensureCamera, stopAll }),
    [micOn, camOn, micPermission, camPermission, videoStream, background, mirror, toggleMic, toggleCam, requestBoth, ensureCamera, stopAll],
  )
  return <LocalMediaContext.Provider value={value}>{children}</LocalMediaContext.Provider>
}
