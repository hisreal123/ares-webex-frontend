import { CircleButton } from '@/components/webex/controls'
import { MediaControls } from '@/components/webex/media-controls'
import { WebexShell } from '@/components/webex/shell'

/** The "Connecting..." splash Webex shows between "Join meeting" and the lobby. */
export function ConnectingScreen({ onLeave }: { onLeave: () => void }) {
  return (
    <WebexShell variant="lobby" momentum showLogo={false}>
      <main className="flex min-h-screen items-center justify-center gap-[8px] text-[16px] leading-[24px]" role="status" aria-live="polite">
        <span
          aria-hidden
          className="block h-[24px] w-[24px] rounded-full border-2 border-transparent"
          style={{ borderBottomColor: 'var(--webex-spinner)', borderLeftColor: 'var(--webex-spinner)', borderRightColor: 'var(--webex-spinner)', animation: 'webex-spin 0.9s linear infinite' }}
        />
        Connecting...
      </main>
      <section aria-label="Controls" className="fixed inset-x-0 bottom-[12px] flex h-[40px] items-center justify-center">
        <MediaControls />
        <CircleButton icon="cancel-bold" danger aria-label="Leave meeting" onClick={onLeave} className="ml-[8px]" />
      </section>
    </WebexShell>
  )
}
