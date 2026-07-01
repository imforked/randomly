import { Link } from "react-router-dom";
import { FlippingText } from "src/components/FlippingLetterPool/FlippingText";
import "./LandingPage.css";

export function LandingPage() {
  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <header className="stack">
          <FlippingText as="h1" text="Randomly" className="guide-prompt" />
          <p className="subhead">
            By{" "}
            <a
              href="https://www.instagram.com/100.11101/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-page__credit-link"
            >
              @100.11101
            </a>
          </p>
        </header>
        <Link to="/create" className="btn">
          Start a Room
        </Link>
      </div>
    </main>
  );
}
