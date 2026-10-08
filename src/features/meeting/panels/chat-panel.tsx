import { useState } from 'react'

import { Icon } from '@/components/webex/icon'

type Tab = 'everyone' | 'direct'
const MAX = 5000

function IconButton({ name, label, active, size = 32, bordered, disabled, onClick }: { name: string; label: string; active?: boolean; size?: number; bordered?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full ${bordered ? 'border border-[#ffffff33]' : ''} ${disabled ? 'text-[#ffffff66]' : active ? 'text-[var(--webex-link)] hover:bg-[var(--webex-surface)]' : 'text-[var(--webex-text-secondary)] hover:bg-[var(--webex-surface)]'}`}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={16} />
    </button>
  )
}

export function ChatPanel({ meetingTitle, onClose }: { meetingTitle: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('everyone')
  const [banner, setBanner] = useState(true)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([])
  const [markdown, setMarkdown] = useState(true)

  const send = () => {
    const t = text.trim()
    if (!t) return
    setMessages((m) => [...m, { id: Date.now(), text: t }])
    setText('')
  }

  return (
    <section aria-label="Chat" className="flex h-full w-[376px] flex-col">
      <div className="flex items-center">
        <h2 className="w-[324.9px] text-[16px] font-bold leading-[24px]">Chat</h2>
        <button type="button" aria-label="Close panel" onClick={onClose} className="ml-[20px] flex h-[20px] w-[20px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)] focus-visible:[box-shadow:var(--webex-focus-ring)] focus-visible:outline-none">
          <Icon name="cancel-bold" size={16} />
        </button>
      </div>

      <div role="tablist" aria-label="Chat" className="-ml-[5px] mt-[18px] flex h-[42px] w-fit items-start gap-[8px] p-[5px]">
        {(['everyone', 'direct'] as Tab[]).map((t) => {
          const on = tab === t
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={`Chat with ${t === 'everyone' ? 'Everyone' : 'Direct'}`}
              onClick={() => setTab(t)}
              className={`relative flex h-[32px] items-center rounded-[8px] px-[12px] text-[14px] leading-[20px] ${on ? 'bg-[#ffffff33] font-bold' : 'font-medium text-[var(--webex-text-secondary)] hover:bg-[var(--webex-surface)]'}`}
            >
              {t === 'everyone' ? 'Everyone' : 'Direct'}
            </button>
          )
        })}
      </div>

      {banner && tab === 'everyone' && (
        <section aria-label="Chat information" className="h-[80px]">
          <div className="mt-[8px] box-border flex h-[64px] w-[376px] items-start gap-[8px] rounded-[8px] border border-[var(--webex-link)] bg-[#0a274a] p-[11px]">
            <Icon name="info-circle-bold" size={20} className="text-[var(--webex-link)]" />
            <p className="w-[260px] text-[14px] font-medium leading-[20px]">Messages to everyone will be saved after the meeting.</p>
            <button type="button" aria-label="Learn more" className="-mt-[4px] ml-auto flex h-[28px] w-[28px] items-center justify-center rounded-full text-[var(--webex-link)] hover:bg-[var(--webex-surface)]">
              <Icon name="help-circle-regular" size={16} />
            </button>
            <button type="button" aria-label="Close banner" onClick={() => setBanner(false)} className="flex h-[20px] w-[20px] items-center justify-center rounded-full hover:bg-[var(--webex-surface)]">
              <Icon name="cancel-bold" size={16} />
            </button>
          </div>
        </section>
      )}

      <div className="relative flex-1 overflow-y-auto" aria-live="polite">
        {messages.length === 0 ? (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <div className="text-[24px] leading-[32px]">Ready, set, chat <span aria-hidden>🚀</span></div>
            <div className="text-[14px] leading-[20px]">Start with a message, a link, or even a fun GIF.</div>
          </div>
        ) : (
          <ul className="flex flex-col gap-[8px] px-[4px] py-[12px]">
            {messages.map((m) => (
              <li key={m.id} className="self-end rounded-[12px] bg-[#ffffff1c] px-[12px] py-[8px] text-[14px] leading-[20px]">{m.text}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-[#ffffff33]">
        <div aria-label="Message composer toolbar" className="flex h-[48px] items-center justify-between px-[16px] pt-[8px]">
          <div role="group" aria-label="Message composer options" className="flex h-[40px] w-[160px] items-center gap-[8px]">
            <div className="m-[4px]"><IconButton name="markdown-bold" label="Markdown" active={markdown} onClick={() => setMarkdown((v) => !v)} /></div>
            <div className="m-[4px] ml-[0px]"><IconButton name="emoji-happy-bold" label="Emoji" /></div>
            <div className="m-[4px] ml-[0px]"><IconButton name="gif-bold" label="GIFs" /></div>
            <div className="m-[4px] ml-[0px]"><IconButton name="mention-bold" label="Mention" /></div>
          </div>
        </div>
        <div className="flex h-[60px] items-start">
          <textarea
            aria-label={`Write a message to ${meetingTitle}`}
            placeholder={`Write a message to ${meetingTitle}`}
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            className="mt-[5px] h-[50px] w-[334px] resize-none bg-transparent pl-[16px] pr-[20px] pt-[12px] text-[14px] leading-[20px] outline-none placeholder:text-[13px] placeholder:text-[var(--webex-text-secondary)]"
          />
          <div className="mt-[8px] ml-[4px] w-[40px] pl-[4px]">
            <IconButton name="send-regular" label="Send" bordered disabled={!text.trim()} onClick={send} />
          </div>
        </div>
        <div className="px-[16px] pb-[8px] text-right text-[12px] leading-[20.6px] text-[var(--webex-text-secondary)]">{text.length} / {MAX}</div>
      </div>
    </section>
  )
}
