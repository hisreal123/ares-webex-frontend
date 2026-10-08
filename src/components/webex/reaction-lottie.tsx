import { useEffect, useRef } from 'react'
import lottie, { type AnimationItem } from 'lottie-web'

// Webex's own reaction animations (extracted from its app), loaded on demand.
const loaders = import.meta.glob('../../assets/reactions/*.json', { import: 'default' }) as Record<string, () => Promise<object>>

function load(name: string) {
  return loaders[`../../assets/reactions/${name}.json`]?.()
}

/**
 * `poster`: which frame to rest on (`'end'` shows the finished pose, a number is a frame).
 * With `playOnHover` the animation plays through once while the pointer is over `hoverTarget`'s parent button.
 */
export function ReactionLottie({
  name,
  size,
  poster = 'end',
  autoplay = false,
  playOnHover = false,
  onComplete,
}: {
  name: string
  size: number
  poster?: 'end' | number
  autoplay?: boolean
  playOnHover?: boolean
  onComplete?: () => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const anim = useRef<AnimationItem | null>(null)

  useEffect(() => {
    let cancelled = false
    void load(name)?.then((data) => {
      if (cancelled || !ref.current) return
      const a = lottie.loadAnimation({ container: ref.current, renderer: 'svg', loop: false, autoplay, animationData: data })
      anim.current = a
      if (!autoplay) a.addEventListener('DOMLoaded', () => a.goToAndStop(poster === 'end' ? a.totalFrames - 1 : poster, true))
      if (onComplete) a.addEventListener('complete', onComplete)
    })
    return () => {
      cancelled = true
      anim.current?.destroy()
      anim.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    if (!playOnHover) return
    const parent = ref.current?.closest('button')
    if (!parent) return
    const enter = () => anim.current?.goToAndPlay(0, true)
    parent.addEventListener('mouseenter', enter)
    parent.addEventListener('focus', enter)
    return () => {
      parent.removeEventListener('mouseenter', enter)
      parent.removeEventListener('focus', enter)
    }
  }, [playOnHover])

  return <span ref={ref} aria-hidden className="inline-block" style={{ width: size, height: size }} />
}
