import { useEffect, useRef } from 'react'

import type { BackgroundSelection, BlurVariant } from '@/features/pre-join/types'

import { useVirtualBackground } from './use-virtual-background'

type VirtualBackgroundVideoProps = {
  stream: MediaStream | null
  selection: BackgroundSelection
  blurVariant: BlurVariant
  mirror?: boolean
  className?: string
}

export function VirtualBackgroundVideo({
  stream,
  selection,
  blurVariant,
  mirror,
  className,
}: VirtualBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { stream: renderedStream } = useVirtualBackground(stream, selection, blurVariant)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = renderedStream
    }
  }, [renderedStream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
    />
  )
}
