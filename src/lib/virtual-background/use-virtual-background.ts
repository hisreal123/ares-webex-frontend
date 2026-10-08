import { useEffect, useState } from 'react'

import type { BackgroundSelection, BlurVariant } from '@/features/pre-join/types'

import { loadBackgroundImage } from './background-image-cache'
import { getImageSegmenter } from './segmenter'

const OUTPUT_FPS = 24

const BLUR_RADIUS_PX: Record<BlurVariant, number> = {
  standard: 12,
  portrait: 20,
}

export type UseVirtualBackgroundResult = {
  stream: MediaStream | null
  ready: boolean
  error: boolean
}

function selectionKey(selection: BackgroundSelection): string {
  return typeof selection === 'string' ? selection : `image:${selection.imageId}`
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height)
  const sw = width / scale
  const sh = height / scale
  const sx = (image.width - sw) / 2
  const sy = (image.height - sh) / 2
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)
}

export function useVirtualBackground(
  stream: MediaStream | null,
  selection: BackgroundSelection,
  blurVariant: BlurVariant
): UseVirtualBackgroundResult {
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const key = selectionKey(selection)
  const active = stream !== null && selection !== 'none'

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let rafId = 0
    let capturedStream: MediaStream | null = null

    const feederVideo = document.createElement('video')
    feederVideo.muted = true
    feederVideo.playsInline = true
    feederVideo.srcObject = stream

    const outputCanvas = document.createElement('canvas')
    const outputCtx = outputCanvas.getContext('2d')
    const fgCanvas = document.createElement('canvas')
    const fgCtx = fgCanvas.getContext('2d')
    const maskCanvas = document.createElement('canvas')
    const maskCtx = maskCanvas.getContext('2d')

    setReady(false)
    setError(false)

    async function start() {
      if (!outputCtx || !fgCtx || !maskCtx) throw new Error('2D canvas context unavailable')

      const segmenter = await getImageSegmenter()
      const bgImage =
        typeof selection === 'object' ? await loadBackgroundImage(selection.imageId) : null
      if (cancelled) return

      await feederVideo.play()
      if (feederVideo.readyState < 2) {
        await new Promise<void>((resolve) => {
          feederVideo.onloadeddata = () => resolve()
        })
      }
      if (cancelled) return

      const vw = feederVideo.videoWidth
      const vh = feederVideo.videoHeight
      outputCanvas.width = vw
      outputCanvas.height = vh
      fgCanvas.width = vw
      fgCanvas.height = vh

      capturedStream = outputCanvas.captureStream(OUTPUT_FPS)
      setProcessedStream(capturedStream)
      setReady(true)

      const render = () => {
        if (cancelled) return
        rafId = requestAnimationFrame(render)

        segmenter.segmentForVideo(feederVideo, performance.now(), (result) => {
          const mask = result.confidenceMasks?.[0]
          if (!mask) return

          fgCtx.drawImage(feederVideo, 0, 0, vw, vh)

          const mw = mask.width
          const mh = mask.height
          const maskData = mask.getAsFloat32Array()
          if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
            maskCanvas.width = mw
            maskCanvas.height = mh
          }
          const alphaImage = maskCtx.createImageData(mw, mh)
          for (let i = 0; i < maskData.length; i++) {
            const alpha = Math.max(0, Math.min(255, Math.round(maskData[i] * 255)))
            const offset = i * 4
            alphaImage.data[offset] = 255
            alphaImage.data[offset + 1] = 255
            alphaImage.data[offset + 2] = 255
            alphaImage.data[offset + 3] = alpha
          }
          maskCtx.putImageData(alphaImage, 0, 0)

          fgCtx.globalCompositeOperation = 'destination-in'
          fgCtx.drawImage(maskCanvas, 0, 0, mw, mh, 0, 0, vw, vh)
          fgCtx.globalCompositeOperation = 'source-over'

          if (selection === 'blur') {
            outputCtx.filter = `blur(${BLUR_RADIUS_PX[blurVariant]}px)`
            outputCtx.drawImage(feederVideo, 0, 0, vw, vh)
            outputCtx.filter = 'none'
          } else if (bgImage) {
            drawCover(outputCtx, bgImage, vw, vh)
          }

          outputCtx.drawImage(fgCanvas, 0, 0)
        })
      }
      rafId = requestAnimationFrame(render)
    }

    start().catch(() => {
      if (!cancelled) {
        setError(true)
        setProcessedStream(null)
        setReady(true)
      }
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      capturedStream?.getTracks().forEach((track) => track.stop())
      feederVideo.srcObject = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `selection` is compared via `key`; `active` gates the effect
  }, [active, stream, key, blurVariant])

  if (!active) {
    return { stream, ready: true, error: false }
  }

  return { stream: error ? stream : processedStream, ready, error }
}
