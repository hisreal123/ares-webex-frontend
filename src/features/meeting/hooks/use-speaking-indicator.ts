import { useEffect, useState } from 'react'

const SPEAKING_THRESHOLD = 12
const SPEAKING_HYSTERESIS_MS = 300

export function useSpeakingIndicator(enabled: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsSpeaking(false)
      return
    }

    let cancelled = false
    let audioContext: AudioContext | null = null
    let stream: MediaStream | null = null
    let rafId = 0
    let silenceTimeout: ReturnType<typeof setTimeout> | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        const data = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
          analyser.getByteFrequencyData(data)
          const average = data.reduce((sum, value) => sum + value, 0) / data.length

          if (average > SPEAKING_THRESHOLD) {
            if (silenceTimeout) {
              clearTimeout(silenceTimeout)
              silenceTimeout = null
            }
            setIsSpeaking(true)
          } else if (!silenceTimeout) {
            silenceTimeout = setTimeout(
              () => setIsSpeaking(false),
              SPEAKING_HYSTERESIS_MS,
            )
          }

          rafId = requestAnimationFrame(tick)
        }

        tick()
      } catch {
        // mic unavailable or permission denied — no speaking indicator
      }
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      if (silenceTimeout) clearTimeout(silenceTimeout)
      stream?.getTracks().forEach((track) => track.stop())
      void audioContext?.close()
    }
  }, [enabled])

  return isSpeaking
}
