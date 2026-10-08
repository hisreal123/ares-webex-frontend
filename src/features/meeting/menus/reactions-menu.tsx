import { ReactionLottie } from '@/components/webex/reaction-lottie'
import { Popover } from './popover'

export const REACTIONS = [
  { id: 'thumb_up', label: 'Thumbs up (Ctrl + Shift + 1)' },
  { id: 'clap', label: 'Clap (Ctrl + Shift + 2)' },
  { id: 'prayer', label: 'Thanks' },
  { id: 'thumb_down', label: 'Thumbs down' },
  { id: 'smile', label: 'Smile' },
  { id: 'haha', label: 'Haha (Ctrl + Shift + 3)' },
  { id: 'wow', label: 'Wow' },
  { id: 'sad', label: 'Sad' },
  { id: 'celebrate', label: 'Celebrate (Ctrl + Shift + 4)' },
  { id: 'heart', label: 'Heart (Ctrl + Shift + 5)' },
  { id: 'speed_up', label: 'Speed up' },
  { id: 'slow_down', label: 'Slow down' },
  { id: 'fire', label: 'Fire' },
]

export function ReactionsMenu({ anchorX, onPick, onClose }: { anchorX: number; onPick: (reactionId: string) => void; onClose: () => void }) {
  return (
    <Popover label="Reactions" width={258} left={anchorX - 129} arrowFromLeft={129} side="above" onClose={onClose} padding="p-[12px]">
      <div className="p-[12px]">
        <div role="group" aria-label="Reaction picker" className="grid w-[208px] grid-cols-[repeat(4,40px)] gap-[16px]">
          {REACTIONS.map((r) => (
            <button key={r.id} type="button" aria-label={r.label} title={r.label} onClick={() => { onPick(r.id); onClose() }} className="flex h-[40px] w-[40px] items-center justify-center rounded-[20px] hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none">
              <ReactionLottie name={r.id} size={28} playOnHover />
            </button>
          ))}
        </div>
      </div>
      <div className="w-[232px] border-t border-[#ffffff33] pt-[8px]">
        <button type="button" className="flex h-[32px] w-full items-center rounded-[8px] px-[12px] text-left text-[14px] leading-[20px] hover:bg-[var(--webex-surface)]">
          Customize reaction shortcuts
        </button>
      </div>
    </Popover>
  )
}
