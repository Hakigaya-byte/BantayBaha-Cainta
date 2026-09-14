import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import './App.css'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import MyReports from './MyReports'
import ReportFlood from './pages/ReportFlood'
import { auth } from './firebase'
import type {
  FloodReport,
  FloodReportInput,
  ReportStatus,
} from './report'
import {
  createFloodReport,
  getCurrentResidentId,
  subscribeToFloodReports,
  updateFloodReportStatus,
} from './firestoreReports'

type ActivePage = 'home' | 'report' | 'my-reports' | 'admin' | 'admin-login'

const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [reports, setReports] = useState<FloodReport[]>([])
  const [reportsError, setReportsError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const residentId = useMemo(() => getCurrentResidentId(), [])
  const myReports = reports.filter((report) => report.residentId === residentId)
  const isAdmin =
    Boolean(currentUser?.email) &&
    currentUser?.email?.toLowerCase() === configuredAdminEmail

  useEffect(() => {
    return onAuthStateChanged(auth, setCurrentUser)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToFloodReports(
      (updatedReports) => {
        setReports(updatedReports)
        setReportsError('')
      },
      () => {
        setReportsError(
          'Firebase cannot load reports yet. Check that Cloud Firestore is enabled and its development rules allow this test app.',
        )
      },
    )

    return unsubscribe
  }, [])

  async function handleReportSubmit(reportInput: FloodReportInput) {
    await createFloodReport(reportInput)
  }

  async function handleStatusUpdate(
    reportId: string,
    newStatus: ReportStatus,
  ) {
    await updateFloodReportStatus(reportId, newStatus)
  }

  function handleAdminLoginSuccess(user: User) {
    setCurrentUser(user)
    setActivePage('admin')
  }

  async function handleLogout() {
    await signOut(auth)
    setCurrentUser(null)
    setActivePage('home')
  }

  if (activePage === 'report') {
    return (
      <ReportFlood
        onBack={() => setActivePage('home')}
        onSubmitReport={handleReportSubmit}
      />
    )
  }

  if (activePage === 'my-reports') {
    return (
      <MyReports
        reports={myReports}
        onBack={() => setActivePage('home')}
      />
    )
  }

  if (activePage === 'admin-login') {
    return (
      <AdminLogin
        onBack={() => setActivePage('home')}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    )
  }

  if (activePage === 'admin') {
    if (!isAdmin || !currentUser?.email) {
      return (
        <AdminLogin
          onBack={() => setActivePage('home')}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )
    }

    return (
      <AdminDashboard
        reports={reports}
        staffEmail={currentUser.email}
        onBack={() => setActivePage('home')}
        onLogout={handleLogout}
        onUpdateStatus={handleStatusUpdate}
      />
    )
  }

  return (
    <main className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">🌧️</span>
          <span>BantayBaha Cainta</span>
        </div>

        <div className="nav-links">
          <button type="button" onClick={() => setActivePage('home')}>
            Home
          </button>

          <button type="button" onClick={() => setActivePage('my-reports')}>
            My Reports
          </button>

          <button type="button">Preparedness</button>
          <button type="button">Advisories</button>
          <button type="button">Emergency Contacts</button>
        </div>

        <button
          className="login-button"
          type="button"
          onClick={() => setActivePage(isAdmin ? 'admin' : 'admin-login')}
        >
          {isAdmin ? 'Staff Dashboard' : 'Staff Login'}
        </button>
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
            <button
              className="primary-button"
              type="button"
              onClick={() => setActivePage('report')}
            >
              Report a Flood
            </button>

            <button className="secondary-button" type="button">
              View Preparedness Guide
            </button>
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
            <span>
              {reports.length === 0
                ? 'Reports are reviewed by DRRMO staff'
                : `${reports.length} report(s) available for DRRMO review`}
            </span>
          </div>
        </div>
      </section>

      {reportsError && <p className="firebase-error">{reportsError}</p>}

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
