import { useLocalMedia } from '@/hooks/use-local-media'
import { SplitButton } from './controls'

// The mic + camera split buttons, shared by the pre-join, lobby and in-call control bars.
export function MediaControls({ onAudioOptions, onVideoOptions }: { onAudioOptions?: (anchorX: number) => void; onVideoOptions?: (anchorX: number) => void } = {}) {
  const media = useLocalMedia()
  return (
    <>
      <SplitButton
        icon={media.micOn ? 'microphone-on-bold' : 'microphone-muted-bold'}
        label={media.micOn ? 'Mute' : 'Unmute'}
        ariaLabel={media.micOn ? 'Microphone is currently unmuted. Mute' : 'Microphone is currently muted. Unmute'}
        optionsLabel="Audio options"
        tooltip={media.micOn ? 'Mute' : 'Unmute'}
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
        ariaLabel={media.camOn ? 'Sending video is currently enabled. Stop video' : 'Sending video is currently off. Start video'}
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
