import { Router } from '@/Router'
import { GuestSessionProvider } from '@/hooks/use-guest-session'
import { LocalMediaProvider } from '@/hooks/use-local-media'

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
