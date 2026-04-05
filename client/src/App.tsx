import { useState } from 'react'
import { FlippingText } from './components/FlippingText'
import { StartRoomModal } from './components/StartRoomModal'

function App() {
  const [roomModalOpen, setRoomModalOpen] = useState(false)

  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <header className="stack">
          <FlippingText
            as="h1"
            text="Randomly"
            className="guide-prompt"
          />
          <p className="subhead">By @100.11101</p>
        </header>
        <button
          type="button"
          className="btn"
          onClick={() => setRoomModalOpen(true)}
        >
          Start a Room
        </button>
      </div>
      <StartRoomModal
        open={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
      />
    </main>
  )
}

export default App
