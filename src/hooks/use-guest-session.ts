import { createContext, useContext } from 'react'

export type GuestSession = {
  name: string
  remember: boolean
  setName: (name: string) => void
  setRemember: (remember: boolean) => void
  /** Persist (or clear) the name according to "Remember me". Called when the guest joins. */
  commit: () => void
}

export const GuestSessionContext = createContext<GuestSession | null>(null)

export function useGuestSession() {
  const ctx = useContext(GuestSessionContext)
  if (!ctx) throw new Error('useGuestSession must be used inside <GuestSessionProvider>')
  return ctx
}
