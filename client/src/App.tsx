import { FlippingText } from './components/FlippingText'

function App() {
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
        <button type="button" className="btn">
          Start a Room
        </button>
      </div>
    </main>
  )
}

export default App
