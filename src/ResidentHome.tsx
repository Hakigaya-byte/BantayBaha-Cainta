import { useEffect, useMemo, useState } from 'react'
import { FaArrowRight, FaBell, FaBookOpen, FaBullhorn, FaChevronRight, FaCircleCheck, FaClock, FaFileLines, FaGlobe, FaLightbulb, FaLocationDot, FaPhone, FaShieldHalved, FaTextHeight, FaUser, FaWater } from 'react-icons/fa6'
import type { Advisory } from './data/advisories'
import { emergencyContacts } from './data/emergencyContacts'
import type { ActivePage } from './navigation'
import type { FloodReport } from './report'
import ReportEvidence from './ReportEvidence'

type Props = {
  reports: FloodReport[]
  loading: boolean
  error: string
  advisories: Advisory[]
  advisoriesLoading: boolean
  advisoriesError: string
  userEmail: string
  loggingOut: boolean
  onLogout: () => Promise<void>
  onNavigate: (page: ActivePage) => void
}

const shortcuts = [
  { icon: FaBookOpen, title: 'Preparedness Guide', text: 'Basahin ang mga gabay at tips.', page: 'preparedness' },
  { icon: FaBullhorn, title: 'Community Advisories', text: 'Published notices and community reminders.', page: 'advisories' },
  { icon: FaPhone, title: 'Emergency Contacts', text: 'Emergency services at barangay hotlines.', page: 'emergency-contacts' },
  { icon: FaFileLines, title: 'My Reports', text: 'View and filter all your submitted reports.', page: 'my-reports' },
] as const

export default function ResidentHome({ reports, loading, error, advisories, advisoriesLoading, advisoriesError, userEmail, loggingOut, onLogout, onNavigate }: Props) {
  const [language, setLanguage] = useState<'en' | 'fil'>(() => window.localStorage.getItem('bb-language') === 'fil' ? 'fil' : 'en')
  const [largeText, setLargeText] = useState(() => window.localStorage.getItem('bb-large-text') === 'true')
  const recent = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  const latestAdvisories = useMemo(() => [...advisories].sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)).slice(0, 3), [advisories])
  const stats = [
    { title: 'Total Reports', icon: FaFileLines, value: reports.length, note: 'Reports you have submitted', color: '' },
    { title: 'Under Review', icon: FaClock, value: reports.filter(r => r.status === 'Under Review').length, note: 'Being reviewed by staff', color: 'icon-amber' },
    { title: 'Verified', icon: FaShieldHalved, value: reports.filter(r => r.status === 'Verified').length, note: 'Checked by authorized staff', color: 'icon-green' },
    { title: 'Resolved', icon: FaCircleCheck, value: reports.filter(r => r.status === 'Resolved').length, note: 'Marked resolved by staff', color: '' },
  ]
  const copy = language === 'fil'
    ? { welcome: 'Maligayang pagbabalik!', hero: 'Mag-report ng insidente, tingnan ang status ng reports, at manatiling updated sa advisories.', advisories: 'Pinakabagong Community Advisories' }
    : { welcome: 'Welcome back!', hero: 'Report incidents, check your report status, and stay informed with community advisories.', advisories: 'Latest Community Advisories' }
  const caintaEmergency = emergencyContacts.find(item => item.id === 'cainta-emergency')?.numbers[0]

  useEffect(() => {
    document.documentElement.classList.toggle('large-text-mode', largeText)
    return () => document.documentElement.classList.remove('large-text-mode')
  }, [largeText])

  function toggleLargeText() {
    const next = !largeText
    setLargeText(next)
    window.localStorage.setItem('bb-large-text', String(next))
    document.documentElement.classList.toggle('large-text-mode', next)
  }

  function toggleLanguage() {
    const next = language === 'en' ? 'fil' : 'en'
    setLanguage(next)
    window.localStorage.setItem('bb-language', next)
  }

  return <>
    <section className="home-hero resident-home-hero"><div className="container resident-home-hero-inner">
      <div className="home-hero-copy"><p className="eyebrow">PARA SA MAS HANDANG CAINTA</p><h1>{copy.welcome}</h1><p className="hero-description">{copy.hero}</p><button className="button button-yellow" onClick={() => onNavigate('report')}><FaFileLines /> Report a Flood <FaArrowRight /></button></div>
      <p className="community-script home-script">Bayanihan para sa<br />Ligtas na Cainta</p>
    </div></section>

    <div className="container resident-home-content">
      <section className="report-stats" aria-label="Your report summary">{stats.map(stat => <article className="panel report-stat" key={stat.title}><span className={'icon-disc ' + stat.color}><stat.icon /></span><div><strong>{loading || error ? '—' : stat.value}</strong><h2>{stat.title}</h2><p>{stat.note}</p></div></article>)}</section>

      <div className="resident-home-grid">
        <section className="panel recent-reports-panel">
          <div className="section-heading"><div><h2>Recent Reports</h2><p>Here are your latest submitted reports.</p></div><button className="text-link" onClick={() => onNavigate('my-reports')}>View all my reports <FaArrowRight /></button></div>
          {loading ? <p role="status">Loading your reports…</p> : error ? <p className="form-error" role="alert">{error}</p> : recent.length === 0 ? <div className="empty-reports"><span className="icon-disc"><FaFileLines /></span><h3>No reports yet</h3><p>Your submitted flood reports will appear here.</p><button className="button button-blue" onClick={() => onNavigate('report')}>Submit your first report <FaArrowRight /></button></div> : <div className="recent-report-list">{recent.map(report => <button className="recent-report-row" key={report.id} onClick={() => onNavigate('my-reports')}>
            <span className="report-thumbnail">{report.photoPath ? <ReportEvidence compact photoName={report.photoName} photoPath={report.photoPath} alt={'Evidence submitted for ' + report.locationDetails} /> : <span className="report-no-photo"><FaWater /><small>No photo attached</small></span>}</span>
            <span className="report-row-copy"><strong className="report-barangay"><FaLocationDot />{report.barangay}</strong><span className="report-location">{report.locationDetails}</span><span className="report-excerpt">{report.description}</span></span>
            <span className={'report-status-panel status-' + report.status.toLowerCase().replaceAll(' ', '-')}><strong>{report.status}</strong><small>Open details and timeline</small></span><FaChevronRight className="report-expand-icon" />
          </button>)}</div>}
        </section>

        <aside className="resident-quick-access">
          <section className="panel quick-access-panel"><h2>Quick Access</h2><p>Helpful tools for a safer Cainta.</p><div>{shortcuts.map(item => <button key={item.page} onClick={() => onNavigate(item.page)}><span className="icon-disc"><item.icon /></span><span><strong>{item.title}</strong><small>{item.text}</small></span><FaChevronRight /></button>)}</div></section>
          <section className="panel resident-account-panel">
            <span className="icon-disc"><FaUser /></span><h2>Account & Accessibility</h2><p className="resident-email">{userEmail}</p>
            <button className="resident-setting" onClick={toggleLanguage}><FaGlobe /><span><strong>{language === 'en' ? 'English' : 'Tagalog'}</strong><small>Switch dashboard language</small></span></button>
            <button className="resident-setting" onClick={toggleLargeText}><FaTextHeight /><span><strong>Large text: {largeText ? 'On' : 'Off'}</strong><small>Improve readability</small></span></button>
            <button className="button button-outline resident-logout" disabled={loggingOut} onClick={() => void onLogout()}>{loggingOut ? 'Logging out…' : 'Log out'}</button>
          </section>
        </aside>
      </div>

      <section className="resident-info-grid">
        <article className="panel resident-advisories-panel">
          <div className="section-heading"><div><p className="eyebrow"><FaBell /> COMMUNITY UPDATES</p><h2>{copy.advisories}</h2><p>Published notices and reminders remain visible while you are signed in.</p></div><button className="text-link" onClick={() => onNavigate('advisories')}>View all advisories <FaArrowRight /></button></div>
          {advisoriesLoading ? <p role="status">Loading advisories…</p> : advisoriesError ? <p className="form-error" role="alert">{advisoriesError}</p> : latestAdvisories.length === 0 ? <p className="small-note">No published advisories yet.</p> : <div className="resident-advisory-list">{latestAdvisories.map((advisory, index) => <button className="resident-advisory-row" key={advisory.id} onClick={() => onNavigate('advisories')}>
            <span className="icon-disc"><FaBullhorn /></span><span className="resident-advisory-copy"><span className="resident-advisory-label">{advisory.category}{advisory.isSample && <span className="sample-badge">SAMPLE</span>}{index === 0 && <span className="resident-new-badge">NEW</span>}</span><strong>{advisory.title}</strong><small>{advisory.summary}</small></span><span className="resident-advisory-date">{new Date(advisory.publishedAt || advisory.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })}<FaChevronRight /></span>
          </button>)}</div>}
        </article>

        <div className="resident-safety-stack">
          <article className="panel resident-emergency-card"><span className="icon-disc icon-amber"><FaPhone /></span><div><p className="eyebrow">PINNED CONTACTS</p><h2>Emergency contacts</h2><p>Use these verified contacts when immediate assistance is needed.</p></div>{caintaEmergency && <a href={'tel:' + caintaEmergency.dialValue}><span>Cainta Emergency</span><strong>{caintaEmergency.display}</strong></a>}<a href="tel:911"><span>National Emergency</span><strong>911</strong></a><button className="text-link" onClick={() => onNavigate('emergency-contacts')}>View all contacts <FaArrowRight /></button></article>
          <article className="panel resident-preparedness-card"><span className="icon-disc"><FaBookOpen /></span><div><p className="eyebrow">PREPAREDNESS REMINDER</p><h2>Handa bago pa bumaha.</h2><p>Review what to prepare before, during, and after flooding.</p></div><button className="button button-blue" onClick={() => onNavigate('preparedness')}>Open preparedness guide <FaArrowRight /></button></article>
        </div>
      </section>

      <section className="panel resident-reminders resident-reminders-wide"><span className="icon-disc icon-amber"><FaLightbulb /></span><h2>Helpful Reminders</h2><ul><li><FaCircleCheck />Keep an eye on verified weather updates and advisories.</li><li><FaCircleCheck />Prepare an emergency bag and household contact list.</li><li><FaCircleCheck />Follow evacuation instructions from local authorities.</li></ul></section>
    </div>
  </>
}
