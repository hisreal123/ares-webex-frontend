import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'webex.guestName'

type GuestSession = {
  name: string
  remember: boolean
  setName: (name: string) => void
  setRemember: (remember: boolean) => void
  /** Persist (or clear) the name according to "Remember me". Called when the guest joins. */
  commit: () => void
}

const Ctx = createContext<GuestSession | null>(null)

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState(readSaved)
  const [remember, setRemember] = useState(true) // Webex ships this checked

  const commit = useCallback(() => {
    try {
      if (remember && name.trim()) localStorage.setItem(STORAGE_KEY, name.trim())
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage blocked: the name just won't be remembered */
    }
  }, [name, remember])

  const value = useMemo(() => ({ name, remember, setName, setRemember, commit }), [name, remember, commit])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGuestSession() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGuestSession must be used inside <GuestSessionProvider>')
  return ctx
}
