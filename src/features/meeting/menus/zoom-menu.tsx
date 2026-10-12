import type { CSSProperties } from 'react'

import { Icon } from '@/components/webex/icon'
import { Popover } from './popover'

const ROUND = 'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-transparent outline-none hover:bg-[#ffffff12] focus-visible:[box-shadow:0_0_0_2px_#000,0_0_0_4px_#64b4fa,0_0_0_5px_#64b4fa59] aria-disabled:cursor-default aria-disabled:text-[#ffffff66] aria-disabled:hover:bg-transparent'

export function ZoomMenu({ anchorX, zoom, maxZoom, onZoom, onClose }: { anchorX: number; zoom: number; maxZoom: number; onZoom: (zoom: number) => void; onClose: () => void }) {
  const fill = maxZoom ? (zoom / maxZoom) * 100 : 0
  return (
    <Popover label="Zoom" width={202} left={anchorX - 101} arrowFromLeft={101} onClose={onClose} padding="px-[12px] py-[6px]">
      <div className="flex h-[28px] items-center gap-[10px]">
        <button type="button" aria-label="Zoom out" aria-disabled={zoom <= 0} data-tooltip="Decrease video size" data-tooltip-side="below" onClick={() => zoom > 0 && onZoom(zoom - 1)} className={ROUND}>
          <Icon name="zoom-out-regular" size={16} />
        </button>
        <input
          type="range"
          aria-label="Zoom"
          min={0}
          max={maxZoom}
          step={1}
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          className="webex-zoom-slider h-[32px] w-[100px]"
          style={{ '--fill': `${fill}%` } as CSSProperties}
        />
        <button type="button" aria-label="Zoom in" aria-disabled={zoom >= maxZoom} data-tooltip="Increase video size" data-tooltip-side="below" onClick={() => zoom < maxZoom && onZoom(zoom + 1)} className={ROUND}>
          <Icon name="zoom-in-regular" size={16} />
        </button>
      </div>
    </Popover>
  )
}
