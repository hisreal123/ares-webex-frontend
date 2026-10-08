import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

import animationData from '@/assets/webex-logo-loop.json'

/** Webex's own looping logo animation (the Lottie file shipped in their join page), 100x100. */
export function LogoLoader({ size = 100 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    })
    return () => anim.destroy()
  }, [])

  return <div ref={ref} role="progressbar" aria-label="Loading Webex" className="mx-auto overflow-hidden" style={{ width: size, height: size }} />
}
