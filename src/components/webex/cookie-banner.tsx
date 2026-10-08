import { useState } from 'react'

const KEY = 'webex.cookieChoice'

function saved() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

// Bottom-left consent card. `join` matches the meeting-join page; `app` matches the Webex web app.
export function CookieBanner({ surface }: { surface: 'join' | 'app' }) {
  const [hidden, setHidden] = useState(() => saved() !== null)
  if (hidden) return null

  const choose = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
    setHidden(true)
  }
  const join = surface === 'join'
  const btn =
    'h-[28px] rounded-[20px] bg-[#000000f2] px-[12px] text-[14px] font-medium leading-[20px] text-[var(--webex-text-primary)]'

  return (
    <div
      role="alertdialog"
      aria-label="privacy"
      className="fixed bottom-0 left-0 z-[99999] w-[650px] max-w-full overflow-hidden rounded-tr-[17px] p-[16px_20px_16px_16px] text-[#000000f2]"
      style={{
        fontSize: join ? 16 : 14,
        lineHeight: join ? '24px' : '23px',
        background: join ? '#f3f2f3' : '#ffffff',
        border: join ? '1px solid #0000001a' : undefined,
        fontFamily: join ? 'var(--webex-font)' : 'var(--webex-font-momentum)',
      }}
    >
      <p>We use cookies to help secure, provide, and improve Webex services.</p>
      <a href="#" className="text-[#0353a8] underline">
        Learn more about our use of cookies.
      </a>
      <div className="mt-[30px] flex items-center justify-between">
        <button type="button" className="text-[#0353a8] underline">
          Manage cookie settings
        </button>
        <div className="flex gap-[16px]">
          <button type="button" className={btn} onClick={() => choose('rejected')}>
            Reject
          </button>
          <button type="button" className={btn} onClick={() => choose('accepted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
