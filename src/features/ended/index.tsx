import { WebexShell } from '@/components/webex/shell'

/** What Webex shows when the host ends the meeting: a title bar, one line, and a Done button. */
export function MeetingEndedPage({ title, onDone, message = 'The meeting has ended.' }: { title: string; onDone: () => void; message?: string }) {
  return (
    <WebexShell variant="lobby" momentum showLogo={false}>
      <div className="flex min-h-screen flex-col" style={{ background: 'linear-gradient(#292929, #1f1f1f)' }}>
        <header className="flex h-[70px] shrink-0 items-start bg-[#191919] px-[24px] pt-[30.5px]">
          <h1 className="text-[24px] font-medium leading-[32px]">{title}</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center" role="status">
          <p className="text-[16px] leading-[24px] text-[var(--webex-text-secondary)]">{message}</p>
          <button
            type="button"
            onClick={onDone}
            className="mt-[8px] h-[32px] w-[66px] rounded-[16px] bg-[#fffffff2] text-[14px] font-medium leading-[16px] text-[#000000f2] hover:brightness-95 active:brightness-90 focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none"
          >
            Done
          </button>
        </main>
      </div>
    </WebexShell>
  )
}
