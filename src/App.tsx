import './App.css'

function App() {
  return (
    <main className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">🌧️</span>
          <span>BantayBaha Cainta</span>
        </div>

        <div className="nav-links">
          <button>Home</button>
          <button>Preparedness</button>
          <button>Advisories</button>
          <button>Emergency Contacts</button>
        </div>

        <button className="login-button">Login</button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">CAINTA DRRMO FLOOD REPORTING WEBSITE</p>

          <h1>
            Report flood incidents.
            <br />
            Stay prepared.
          </h1>

          <p className="hero-text">
            BantayBaha Cainta helps residents submit flood reports and access
            disaster preparedness information, emergency contacts, and official
            advisories from Cainta DRRMO.
          </p>

          <div className="hero-actions">
            <button className="primary-button">Report a Flood</button>
            <button className="secondary-button">View Preparedness Guide</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-icon">📍</div>
          <h2>Need to report flooding?</h2>
          <p>
            Send the location, flood severity, description, and an optional
            photo to help DRRMO review the incident.
          </p>

          <div className="status-row">
            <span className="status-dot"></span>
            <span>Reports are reviewed by DRRMO staff</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <p className="section-label">HOW IT WORKS</p>
        <h2>Simple reporting. Clear updates.</h2>

        <div className="feature-grid">
          <article className="feature-card">
            <span>01</span>
            <h3>Submit a report</h3>
            <p>Enter the location, barangay, severity, and details of the flood incident.</p>
          </article>

          <article className="feature-card">
            <span>02</span>
            <h3>DRRMO reviews it</h3>
            <p>Authorized staff can review and verify the submitted information.</p>
          </article>

          <article className="feature-card">
            <span>03</span>
            <h3>Track the status</h3>
            <p>Residents can check if their report is under review, verified, or resolved.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App