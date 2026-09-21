import { FaFileLines, FaClock, FaShieldHalved, FaCircleCheck, FaArrowRight, FaBookOpen, FaBullhorn, FaPhone, FaChevronRight, FaLightbulb, FaWater, FaLocationDot } from 'react-icons/fa6'
import type { FloodReport } from './report'
import type { ActivePage } from './navigation'
import ReportEvidence from './ReportEvidence'

type Props = { reports: FloodReport[]; loading: boolean; error: string; onNavigate: (page: ActivePage) => void }
const shortcuts = [
  { icon: FaBookOpen, title: 'Preparedness Guide', text: 'Basahin ang mga gabay at tips.', page: 'preparedness' },
  { icon: FaBullhorn, title: 'Community Advisories', text: 'Published notices and community reminders.', page: 'advisories' },
  { icon: FaPhone, title: 'Emergency Contacts', text: 'Emergency services at barangay hotlines.', page: 'emergency-contacts' },
  { icon: FaFileLines, title: 'My Reports', text: 'View and filter all your submitted reports.', page: 'my-reports' },
] as const

export default function ResidentHome({ reports, loading, error, onNavigate }: Props) {
  const recent = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  const stats = [
    { title: 'Total Reports', icon: FaFileLines, value: reports.length, note: 'Reports you have submitted', color: '' },
    { title: 'Under Review', icon: FaClock, value: reports.filter(r => r.status === 'Under Review').length, note: 'Being reviewed by staff', color: 'icon-amber' },
    { title: 'Verified', icon: FaShieldHalved, value: reports.filter(r => r.status === 'Verified').length, note: 'Checked by authorized staff', color: 'icon-green' },
    { title: 'Resolved', icon: FaCircleCheck, value: reports.filter(r => r.status === 'Resolved').length, note: 'Marked resolved by staff', color: '' },
  ]
  return <>
    <section className="home-hero resident-home-hero"><div className="container resident-home-hero-inner">
      <div className="home-hero-copy"><p className="eyebrow">PARA SA MAS HANDANG CAINTA</p><h1>Welcome back!</h1><p className="hero-description">Report incidents, check the status of your reports,<br className="desktop-break" /> and stay informed with community advisories.</p><button className="button button-yellow" onClick={() => onNavigate('report')}><FaFileLines /> Report a Flood <FaArrowRight /></button></div>
      <p className="community-script home-script">Bayanihan para sa<br />Ligtas na Cainta</p>
    </div></section>
    <div className="container resident-home-content">
      <section className="report-stats" aria-label="Your report summary">{stats.map(stat => <article className="panel report-stat" key={stat.title}><span className={'icon-disc ' + stat.color}><stat.icon /></span><div><strong>{loading || error ? '—' : stat.value}</strong><h2>{stat.title}</h2><p>{stat.note}</p></div></article>)}</section>
      <div className="resident-home-grid">
        <section className="panel recent-reports-panel"><div className="section-heading"><div><h2>Recent Reports</h2><p>Here are your latest submitted reports.</p></div><button className="text-link" onClick={() => onNavigate('my-reports')}>View all my reports <FaArrowRight /></button></div>
          {loading ? <p role="status">Loading your reports…</p> : error ? <p className="form-error" role="alert">{error}</p> : recent.length === 0 ? <div className="empty-reports"><span className="icon-disc"><FaFileLines /></span><h3>No reports yet</h3><p>Your submitted flood reports will appear here.</p><button className="button button-blue" onClick={() => onNavigate('report')}>Submit your first report <FaArrowRight /></button></div> : <div className="recent-report-list">{recent.map(report => <button className="recent-report-row" key={report.id} onClick={() => onNavigate('my-reports')} aria-label={'View your reports, including ' + report.barangay}>
            <span className="report-thumbnail">{report.photoPath ? <ReportEvidence compact photoName={report.photoName} photoPath={report.photoPath} alt={'Evidence submitted for ' + report.locationDetails} /> : <span className="report-no-photo"><FaWater /><small>No photo attached</small></span>}</span>
            <span className="report-row-copy"><strong className="report-barangay"><FaLocationDot />{report.barangay}</strong><span className="report-location">{report.locationDetails}</span><span className="report-excerpt">{report.description}</span><span className="report-row-meta"><span className={'severity-badge severity-' + report.severity.toLowerCase()}><FaWater /> {report.severity}</span><span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : 'Saving…'}</span></span></span>
            <span className={'report-status-panel status-' + report.status.toLowerCase().replaceAll(' ', '-')}><strong>{report.status === 'Under Review' || report.status === 'Submitted' ? <FaClock /> : <FaCircleCheck />}{report.status}</strong><small>View details in My Reports</small></span><FaChevronRight className="report-expand-icon" />
          </button>)}</div>}
        </section>
        <aside className="resident-quick-access"><section className="panel quick-access-panel"><h2>Quick Access</h2><p>Helpful tools for a safer Cainta.</p><div>{shortcuts.map(item => <button key={item.page} onClick={() => onNavigate(item.page)}><span className="icon-disc"><item.icon /></span><span><strong>{item.title}</strong><small>{item.text}</small></span><FaChevronRight /></button>)}</div></section>
          <section className="panel resident-reminders"><span className="icon-disc icon-amber"><FaLightbulb /></span><h2>Helpful Reminders</h2><p>Small steps for a safer you and family.</p><ul><li><FaCircleCheck />Keep an eye on official weather updates.</li><li><FaCircleCheck />Prepare an emergency bag and contact list.</li><li><FaCircleCheck />Follow evacuation instructions from authorities.</li></ul></section>
        </aside>
      </div>
    </div>
  </>
}
