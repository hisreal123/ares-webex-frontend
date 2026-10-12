import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { GuestSessionContext } from './use-guest-session'

const STORAGE_KEY = 'webex.guestName'

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
  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>
}
