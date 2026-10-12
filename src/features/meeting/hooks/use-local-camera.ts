import { useEffect, useState } from 'react'

export function useLocalCamera(enabled: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let activeStream: MediaStream | null = null

    async function start() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }
        activeStream = mediaStream
        setStream(mediaStream)
        setError(false)
      } catch {
        // camera unavailable or permission denied — tile falls back to the placeholder avatar
        if (!cancelled) setError(true)
      }
    }

    void start()

    return () => {
      cancelled = true
      activeStream?.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [enabled])

  return { stream: enabled ? stream : null, error: enabled && error }
}
