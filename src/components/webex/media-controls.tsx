import { useLocalMedia } from '@/hooks/use-local-media'
import { SplitButton } from './controls'

// The mic + camera split buttons, shared by the pre-join, lobby and in-call control bars.
export function MediaControls({ onAudioOptions, onVideoOptions, spacebarHint }: { onAudioOptions?: (anchorX: number) => void; onVideoOptions?: (anchorX: number) => void; spacebarHint?: boolean } = {}) {
  const media = useLocalMedia()
  return (
    <>
      <SplitButton
        icon={media.micOn ? 'microphone-on-bold' : 'microphone-muted-bold'}
        label={media.micOn ? 'Mute' : 'Unmute'}
        ariaLabel={media.micOn ? 'Microphone is currently unmuted - click to mute' : 'Microphone is currently muted - click to unmute'}
        optionsLabel="Audio options"
        tooltip={media.micOn ? 'Mute' : spacebarHint ? 'Unmute, or press and hold the Spacebar to temporarily unmute' : 'Unmute'}
        optionsTooltip="Audio options"
        width={161.27}
        on={media.micOn}
        warning={media.micPermission !== 'granted'}
        onToggle={() => void media.toggleMic()}
        onOptions={onAudioOptions}
      />
      <SplitButton
        icon={media.camOn ? 'camera-on-bold' : 'camera-muted-bold'}
        label={media.camOn ? 'Stop video' : 'Start video'}
        ariaLabel={media.camOn ? 'Sending video is currently enabled - click to disable' : 'Sending video is currently disabled - click to enable'}
        optionsLabel="Video options"
        tooltip={media.camOn ? 'Stop video' : 'Start video'}
        optionsTooltip="Video options"
        width={185.3}
        on={media.camOn}
        warning={media.camPermission !== 'granted'}
        onToggle={() => void media.toggleCam()}
        onOptions={onVideoOptions}
      />
    </>
  )
}
