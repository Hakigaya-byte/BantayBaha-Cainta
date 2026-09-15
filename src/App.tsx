import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import './App.css'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import MyReports from './MyReports'
import ReportFlood from './pages/ReportFlood'
import Preparedness from './pages/Preparedness'
import { auth } from './firebase'
import ResidentLogin from './ResidentLogin'
import { useAccount } from './useAccount'
import type {
  FloodReport,
  FloodReportInput,
  ReportStatus,
} from './report'
import {
  createFloodReport,
  subscribeToFloodReports,
  updateFloodReportStatus,
} from './firestoreReports'

type ActivePage = 'home' | 'report' | 'my-reports' | 'admin' | 'admin-login' | 'resident-login' | 'preparedness'

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const { user: currentUser, isStaff: isAdmin, loading: accountLoading, error: accountError } = useAccount()
  const [reportState, setReportState] = useState<{ key: string; reports: FloodReport[]; error: string }>({ key: '', reports: [], error: '' })
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const uid = currentUser?.uid
  const reportKey = uid && !accountLoading && !accountError ? `${uid}:${isAdmin}` : ''
  const reports = reportKey && reportState.key === reportKey ? reportState.reports : []
  const reportsError = reportKey && reportState.key === reportKey ? reportState.error : ''
  const reportsLoading = Boolean(reportKey) && reportState.key !== reportKey
  const myReports = reports.filter((report) => report.residentId === uid)

  useEffect(() => {
    if (!reportKey || !uid) return
    let active = true
    const unsubscribe = subscribeToFloodReports(uid, isAdmin,
      (updatedReports) => {
        if (active) setReportState({ key: reportKey, reports: updatedReports, error: '' })
      },
      () => {
        if (active) setReportState({ key: reportKey, reports: [], error: 'Unable to load reports. Check your connection and reload the page.' })
      },
    )

    return () => { active = false; unsubscribe() }
  }, [uid, isAdmin, reportKey])

  async function handleReportSubmit(reportInput: FloodReportInput) {
    await createFloodReport(reportInput)
  }

  async function handleStatusUpdate(
    reportId: string,
    newStatus: ReportStatus,
  ) {
    await updateFloodReportStatus(reportId, newStatus)
  }

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await signOut(auth)
      setReportState({ key: '', reports: [], error: '' })
      setActivePage('home')
    } catch {
      setLogoutError('Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  // Public information must remain readable even while account access loads or fails.
  if (activePage === 'preparedness') {
    return <Preparedness onBack={() => {
      setActivePage('home')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }} />
  }

  if (activePage !== 'home' && (accountLoading || accountError)) {
    return <main className="report-page"><section className="report-form-card">
      <button className="back-button" onClick={() => setActivePage('home')}>← Back to Home</button>
      <p role={accountError ? 'alert' : 'status'}>{accountError || 'Loading your account…'}</p>
    </section></main>
  }

  if (activePage === 'resident-login' || (!currentUser && (activePage === 'report' || activePage === 'my-reports'))) {
    return <ResidentLogin onBack={() => setActivePage('home')}
      onSuccess={() => setActivePage(activePage === 'report' ? 'report' : 'my-reports')} />
  }

  if (activePage === 'report') {
    return (
      <ReportFlood
        key={uid}
        onBack={() => setActivePage('home')}
        onSubmitReport={handleReportSubmit}
      />
    )
  }

  if (activePage === 'my-reports') {
    return (
      <MyReports
        reports={myReports}
        loading={reportsLoading}
        error={reportsError}
        onBack={() => setActivePage('home')}
      />
    )
  }

  if (activePage === 'admin-login' && !currentUser) {
    return (
      <AdminLogin
        onBack={() => setActivePage('home')}
        onLoginSuccess={() => setActivePage('admin')}
      />
    )
  }

  if (activePage === 'admin' || activePage === 'admin-login') {
    if (!currentUser) {
      return (
        <AdminLogin
          onBack={() => setActivePage('home')}
          onLoginSuccess={() => setActivePage('admin')}
        />
      )
    }

    if (!isAdmin) return <main className="report-page"><section className="report-form-card">
      <h1>Staff access required</h1>
      <p>This account has resident access. Staff accounts are assigned by the project administrator.</p>
      <button className="primary-button" onClick={() => setActivePage('my-reports')}>View my reports</button>
      <button className="logout-button" onClick={() => void handleLogout()} disabled={loggingOut}>Log out</button>
      {logoutError && <p role="alert" className="form-error">{logoutError}</p>}
    </section></main>

    return (
      <AdminDashboard
        key={uid}
        reports={reports}
        staffEmail={currentUser.email ?? ''}
        loading={reportsLoading}
        error={reportsError || logoutError}
        loggingOut={loggingOut}
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

          <button type="button" onClick={() => setActivePage('preparedness')}>Preparedness</button>
          <button type="button">Advisories</button>
          <button type="button">Emergency Contacts</button>
        </div>

        <div className="account-actions">
        {!currentUser && <button className="login-button" type="button" disabled={accountLoading}
          onClick={() => setActivePage('resident-login')}>Resident Login</button>}
        <button
          className="login-button"
          type="button"
          disabled={accountLoading}
          onClick={() => setActivePage(isAdmin ? 'admin' : 'admin-login')}
        >
          {isAdmin ? 'Staff Dashboard' : 'Staff Login'}
        </button>
        {currentUser && <button className="logout-button" type="button" disabled={loggingOut}
          onClick={() => void handleLogout()}>{loggingOut ? 'Logging out…' : 'Log out'}</button>}
        </div>
      </nav>
      {currentUser && <p className="account-banner">Signed in as {currentUser.email}</p>}
      {(accountError || logoutError) && <p className="firebase-error" role="alert">{accountError || logoutError}</p>}

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

            <button className="secondary-button" type="button" onClick={() => setActivePage('preparedness')}>
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
              Reports are reviewed by DRRMO staff
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
