import { useState } from 'react'
import { FaFileLines, FaClock, FaShieldHalved, FaCircleCheck, FaLocationDot, FaCalendarDays, FaWater, FaLightbulb, FaArrowRight, FaChevronDown } from 'react-icons/fa6'
import type { FloodReport, ReportStatus } from './report'
import ReportEvidence from './ReportEvidence'

type Props = { reports: FloodReport[]; loading: boolean; error: string; onBack: () => void; onReport: () => void }
const statuses: ReportStatus[] = ['Submitted', 'Under Review', 'Verified', 'Resolved', 'Closed']
const statusMessages: Record<ReportStatus, string> = {
  Submitted: 'Your report is waiting for staff review.',
  'Under Review': 'Staff are reviewing the submitted information.',
  Verified: 'The report has been checked by staff.',
  Resolved: 'Staff have marked this report as resolved.',
  Closed: 'Staff have closed this report.',
}
function statusClass(status: ReportStatus) { return status.toLowerCase().replaceAll(' ', '-') }

export default function MyReports({ reports, loading, error, onBack, onReport }: Props) {
  const [filter, setFilter] = useState<'All' | ReportStatus>('All')
  const [sort, setSort] = useState('newest')
  const visible = reports.filter(report => filter === 'All' || report.status === filter)
    .sort((a, b) => (sort === 'newest' ? -1 : 1) * a.createdAt.localeCompare(b.createdAt))
  const summary = [
    { title: 'Total Reports', count: reports.length, note: 'Reports you have submitted', icon: FaFileLines, style: '' },
    { title: 'Under Review', count: reports.filter(r => r.status === 'Under Review').length, note: 'Being reviewed by staff', icon: FaClock, style: 'icon-amber' },
    { title: 'Verified', count: reports.filter(r => r.status === 'Verified').length, note: 'Checked by authorized staff', icon: FaShieldHalved, style: 'icon-green' },
    { title: 'Resolved', count: reports.filter(r => r.status === 'Resolved').length, note: 'Marked resolved by staff', icon: FaCircleCheck, style: '' },
  ]
  return <div className="container my-reports-content">
    <section className="report-stats" aria-label="Your report summary">{summary.map(item => <article className="panel report-stat" key={item.title}><span className={'icon-disc ' + item.style}><item.icon /></span><div><strong>{loading || error ? '—' : item.count}</strong><h2>{item.title}</h2><p>{item.note}</p></div></article>)}</section>
    <div className="resident-reports-layout">
      <section className="resident-reports-main" aria-label="Submitted reports">
        <div className="reports-toolbar"><div className="status-filters" aria-label="Filter reports by status">{(['All', ...statuses] as const).map(status => <button type="button" key={status} aria-pressed={filter === status} className={filter === status ? 'selected' : ''} onClick={() => setFilter(status)}>{status === 'All' ? 'All Reports' : status}</button>)}</div><label className="sort-control">Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
        {loading ? <div className="panel empty-reports" role="status">Loading your reports…</div> : error ? <p className="form-error" role="alert">{error}</p> : visible.length === 0 ? <div className="panel empty-reports"><span className="icon-disc"><FaFileLines /></span><h2>{reports.length ? 'No matching reports' : 'Your reports will appear here'}</h2><p>{reports.length ? 'Try another status to find your report.' : 'Submit your first flood report to track its progress from one place.'}</p><button className="button button-blue" onClick={reports.length ? () => setFilter('All') : onReport}>{reports.length ? 'Show all reports' : 'Report a Flood'} <FaArrowRight /></button></div> : <div className="resident-report-list">
          <p className="sr-only" role="status">{visible.length} reports shown</p>
          {visible.map(report => <details className="panel resident-report" key={report.id}>
            <summary>
              <span className="report-thumbnail">{report.photoPath ? <ReportEvidence compact photoName={report.photoName} photoPath={report.photoPath} alt={'Submitted evidence for ' + report.locationDetails} /> : <span className="report-no-photo"><FaWater /><small>No photo attached</small></span>}</span>
              <span className="report-row-copy"><strong className="report-barangay"><FaLocationDot /> {report.barangay}</strong><span className="report-location">{report.locationDetails}</span><span className="report-excerpt">{report.description}</span><span className="report-row-meta"><span className={'severity-badge severity-' + report.severity.toLowerCase()}><FaWater /> {report.severity}</span><span><FaCalendarDays /> {report.createdAt ? new Date(report.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'Saving…'}</span></span></span>
              <span className={'report-status-panel status-' + statusClass(report.status)}><strong>{report.status === 'Under Review' || report.status === 'Submitted' ? <FaClock /> : <FaCircleCheck />}{report.status}</strong><small>{statusMessages[report.status]}</small></span><FaChevronDown className="report-expand-icon" />
            </summary>
            <div className="report-expanded"><h3>Incident details</h3><p className="report-description">{report.description}</p><p className="small-note">Report reference: {report.id}</p>{report.photoPath && <ReportEvidence photoName={report.photoName} photoPath={report.photoPath} alt={'Full evidence photo for ' + report.locationDetails} />}{!report.photoPath && report.photoName && <p className="small-note">Legacy filename: {report.photoName}. No stored image is attached.</p>}</div>
          </details>)}
        </div>}
      </section>
      <aside className="panel reports-help"><span className="icon-disc icon-amber"><FaLightbulb /></span><h2>Track. Stay informed.<br />Make a safer Cainta.</h2><p>Check the status of your submitted flood reports here. Staff updates appear when your report is reviewed.</p><ul><li><FaCircleCheck /> Only your own reports appear here.</li><li><FaCircleCheck /> Add clear location and incident details.</li><li><FaCircleCheck /> Photos are optional supporting evidence.</li></ul><p className="small-note">This is a student prototype, not a rescue request or live dispatch service.</p><button className="button button-blue" onClick={onReport}>Submit another report <FaArrowRight /></button><img src="/assets/emergency-kit.png" alt="Emergency bag with essential supplies" loading="lazy" /></aside>
    </div>
    <button className="back-button page-back" onClick={onBack}>Back to Home</button>
  </div>
}
