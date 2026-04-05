function App() {
  return (
    <main className="shell stack-lg">
      <header className="stack">
        <p className="caption">Randomly</p>
        <h1 className="guide-prompt">What are you deciding on?</h1>
        <p className="subhead">
          Answer a few questions—we’ll use your responses to set things up.
        </p>
      </header>

      <section className="stack" aria-labelledby="example-fields">
        <h2 id="example-fields" className="field-label">
          Example fields
        </h2>
        <p className="text-body">
          Use <code className="inline-code">.guide-prompt</code> for guiding
          questions like “How big is your room?” or “How many options per
          guest?”.
        </p>
        <label className="field-label" htmlFor="demo-input">
          Label
        </label>
        <input
          id="demo-input"
          className="field-input"
          type="text"
          placeholder="Placeholder"
          autoComplete="off"
        />
        <div className="stack" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn">
            Continue
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
