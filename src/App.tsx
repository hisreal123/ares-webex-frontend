import { Router } from '@/Router'
import { GuestSessionProvider } from '@/hooks/guest-session-provider'
import { LocalMediaProvider } from '@/hooks/local-media-provider'

function App() {
  return (
    <GuestSessionProvider>
      <LocalMediaProvider>
        <Router />
      </LocalMediaProvider>
    </GuestSessionProvider>
  )
}

export default App
