import { Link } from 'react-router-dom'
import { FlippingText } from '../components/FlippingText'

export function LandingPage() {
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
        <Link to="/create" className="btn">
          Start a Room
        </Link>
      </div>
    </main>
  )
}
