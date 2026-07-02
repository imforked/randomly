import { Link } from "react-router-dom";
import { FlippingText } from "src/components/FlippingLetterPool/FlippingText";
import "./LandingPage.css";

export function LandingPage() {
  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <header className="stack">
          <FlippingText as="h1" text="randomly" className="guide-prompt" />
          <p className="subhead">
            by{" "}
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
          start a room
        </Link>
      </div>
    </main>
  );
}
