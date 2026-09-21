import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import './App.css'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import MyReports from './MyReports'
import ReportFlood from './pages/ReportFlood'
import Preparedness from './pages/Preparedness'
import Advisories from './pages/Advisories'
import EmergencyContacts from './pages/EmergencyContacts'
import { auth } from './firebase'
import ResidentLogin from './ResidentLogin'
import { useAccount } from './useAccount'
import SiteShell, { PageHero } from './SiteShell'
import Home from './Home'
import ResidentHome from './ResidentHome'
import type { ActivePage } from './navigation'
import type { Advisory, AdvisoryInput } from './data/advisories'
import type { FloodReport, FloodReportInput, ReportStatus } from './report'
import { createFloodReport, subscribeToFloodReports, updateFloodReportStatus } from './firestoreReports'
import { createAdvisory, deleteAdvisory, subscribeToAdvisories, updateAdvisory } from './firestoreAdvisories'

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const { user: currentUser, isStaff: isAdmin, loading: accountLoading, error: accountError } = useAccount()
  const [reportState, setReportState] = useState<{ key: string; reports: FloodReport[]; error: string }>({ key: '', reports: [], error: '' })
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [advisoryState, setAdvisoryState] = useState<{ key: string; advisories: Advisory[]; error: string }>({ key: '', advisories: [], error: '' })
  const uid = currentUser?.uid
  const reportKey = uid && !accountLoading && !accountError ? uid + ':' + isAdmin : ''
  const reports = reportKey && reportState.key === reportKey ? reportState.reports : []
  const reportsError = reportKey && reportState.key === reportKey ? reportState.error : ''
  const reportsLoading = Boolean(reportKey) && reportState.key !== reportKey
  const myReports = reports.filter(report => report.residentId === uid)
  const advisoryKey = isAdmin && uid ? 'staff:' + uid : 'public'
  const advisories = advisoryState.key === advisoryKey ? advisoryState.advisories : []
  const advisoriesError = advisoryState.key === advisoryKey ? advisoryState.error : ''
  const advisoriesLoading = advisoryState.key !== advisoryKey
  const publishedAdvisories = advisories.filter(advisory => advisory.isPublished)

  function navigate(page: ActivePage) { setActivePage(page) }
  function returnToHome() { navigate('home') }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [activePage])

  useEffect(() => {
    if (!reportKey || !uid) return
    let active = true
    const unsubscribe = subscribeToFloodReports(uid, isAdmin,
      updatedReports => { if (active) setReportState({ key: reportKey, reports: updatedReports, error: '' }) },
      () => { if (active) setReportState({ key: reportKey, reports: [], error: 'Unable to load reports. Check your connection and reload the page.' }) },
    )
    return () => { active = false; unsubscribe() }
  }, [uid, isAdmin, reportKey])

  useEffect(() => {
    let active = true
    const unsubscribe = subscribeToAdvisories(isAdmin,
      updatedAdvisories => { if (active) setAdvisoryState({ key: advisoryKey, advisories: updatedAdvisories, error: '' }) },
      () => { if (active) setAdvisoryState({ key: advisoryKey, advisories: [], error: 'Unable to load advisories. Check your connection and Firestore rules.' }) },
    )
    return () => { active = false; unsubscribe() }
  }, [advisoryKey, isAdmin])

  async function handleReportSubmit(input: FloodReportInput) { return createFloodReport(input) }
  async function handleCreateAdvisory(input: AdvisoryInput) { await createAdvisory(input) }
  async function handleUpdateAdvisory(id: string, input: AdvisoryInput) { await updateAdvisory(id, input) }
  async function handleDeleteAdvisory(id: string) { await deleteAdvisory(id) }
  async function handleStatusUpdate(id: string, status: ReportStatus) { await updateFloodReportStatus(id, status) }
  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await signOut(auth)
      setReportState({ key: '', reports: [], error: '' })
      navigate('home')
    } catch { setLogoutError('Unable to log out. Please try again.') }
    finally { setLoggingOut(false) }
  }

  function renderPage() {
    // Public information stays accessible even if account loading fails.
    if (activePage === 'preparedness') return <>
      <PageHero eyebrow="BE PREPARED. STAY SAFE. A STRONGER CAINTA." title="Flood Preparedness Guide" description="Be informed. Be ready. Learn what to do before, during, and after a flood to help keep your family and community safe." />
      <Preparedness onBack={returnToHome} onContacts={() => navigate('emergency-contacts')} />
    </>
    if (activePage === 'advisories') return <>
      <PageHero eyebrow="COMMUNITY INFORMATION" title="Community Advisories" description="Stay informed with published notices, weather reminders, and preparedness updates from our school prototype." />
      <Advisories advisories={publishedAdvisories} loading={advisoriesLoading} error={advisoriesError} onBack={returnToHome} onPreparedness={() => navigate('preparedness')} onContacts={() => navigate('emergency-contacts')} />
    </>
    if (activePage === 'emergency-contacts') return <>
      <PageHero eyebrow="EMERGENCY SUPPORT FOR A SAFER CAINTA" title="Emergency Contacts" description="Find emergency services and your barangay's contact numbers. Keep these details handy, especially during heavy rains and floods." />
      <EmergencyContacts onBack={returnToHome} />
    </>
    if (activePage !== 'home' && (accountLoading || accountError)) return <div className="report-page"><section className="report-form-card"><button className="back-button" onClick={returnToHome}>Back to Home</button><p role={accountError ? 'alert' : 'status'}>{accountError || 'Loading your account…'}</p></section></div>
    if (activePage === 'resident-login' || (!currentUser && (activePage === 'report' || activePage === 'my-reports'))) return <ResidentLogin onBack={returnToHome} onStaffLogin={() => navigate('admin-login')} onSuccess={() => navigate(activePage === 'report' ? 'report' : activePage === 'my-reports' ? 'my-reports' : 'home')} />
    if (activePage === 'report') return <ReportFlood key={uid} onBack={returnToHome} onContacts={() => navigate('emergency-contacts')} onMyReports={() => navigate('my-reports')} onSubmitReport={handleReportSubmit} />
    if (activePage === 'my-reports') return <>
      <PageHero eyebrow="MY REPORTS" title="My Flood Reports" description="View and track the status of your submitted flood reports. Together, we keep Cainta safer and more prepared." />
      <MyReports reports={myReports} loading={reportsLoading} error={reportsError} onBack={returnToHome} onReport={() => navigate('report')} />
    </>
    if (activePage === 'admin' || activePage === 'admin-login') {
      if (!currentUser) return <AdminLogin onBack={returnToHome} onResidentLogin={() => navigate('resident-login')} onLoginSuccess={() => navigate('admin')} />
      if (!isAdmin) return <div className="report-page"><section className="report-form-card"><h1>Staff access required</h1><p>This account has resident access. Staff accounts are assigned by the project administrator.</p><button className="primary-button" onClick={() => navigate('my-reports')}>View my reports</button></section></div>
      return <AdminDashboard key={uid} reports={reports} staffEmail={currentUser.email ?? ''} loading={reportsLoading} error={reportsError} loggingOut={loggingOut} onBack={returnToHome} onLogout={handleLogout} onUpdateStatus={handleStatusUpdate} advisories={advisories} advisoriesLoading={advisoriesLoading} advisoriesError={advisoriesError} onCreateAdvisory={handleCreateAdvisory} onUpdateAdvisory={handleUpdateAdvisory} onDeleteAdvisory={handleDeleteAdvisory} onContacts={() => navigate('emergency-contacts')} onAdvisories={() => navigate('advisories')} />
    }
    if (currentUser && !isAdmin && !accountLoading && !accountError) return <ResidentHome reports={myReports} loading={reportsLoading} error={reportsError} onNavigate={navigate} />
    return <Home onNavigate={navigate} advisories={publishedAdvisories} loading={advisoriesLoading} error={advisoriesError} signedIn={Boolean(currentUser)} />
  }

  return <SiteShell page={activePage} onNavigate={navigate} userEmail={currentUser?.email} isStaff={isAdmin} accountLoading={accountLoading} loggingOut={loggingOut} onLogout={handleLogout}>
    {(logoutError || (activePage === 'home' && accountError)) && <p className="container form-error" role="alert">{logoutError || accountError}</p>}
    {renderPage()}
  </SiteShell>
}

export default App
