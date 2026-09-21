import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaBullhorn, FaChevronLeft, FaChevronRight, FaCircleCheck, FaCirclePlus, FaClock, FaCloudRain, FaFileLines, FaPhone, FaShieldHalved, FaUsers, FaWater, FaXmark } from 'react-icons/fa6'
import type { FloodReport, FloodSeverity, ReportStatus } from './report'
import ReportEvidence from './ReportEvidence'
import AdminAdvisories from './AdminAdvisories'
import type { Advisory, AdvisoryInput } from './data/advisories'
import { emergencyContacts } from './data/emergencyContacts'
import './AdminDashboard.css'

type AdminDashboardProps = {
  reports: FloodReport[]
  staffEmail: string
  loading: boolean
  error: string
  loggingOut: boolean
  onBack: () => void
  onLogout: () => Promise<void>
  onUpdateStatus: (reportId: string, newStatus: ReportStatus) => Promise<void>
  advisories: Advisory[]
  advisoriesLoading: boolean
  advisoriesError: string
  onCreateAdvisory: (input: AdvisoryInput) => Promise<void>
  onUpdateAdvisory: (advisoryId: string, input: AdvisoryInput) => Promise<void>
  onDeleteAdvisory: (advisoryId: string) => Promise<void>
  onContacts?: () => void
  onAdvisories?: () => void
}
const statusOptions: ReportStatus[] = ['Submitted', 'Under Review', 'Verified', 'Resolved', 'Closed']
const severities: FloodSeverity[] = ['Low', 'Medium', 'High']
const pageSize = 5
const categoryIcons = { Flood: FaWater, Weather: FaCloudRain, Community: FaBullhorn }
const quickContacts = emergencyContacts.filter(contact => ['cainta-emergency', 'cainta-fire', 'cainta-police', 'cainta-hospital'].includes(contact.id))
const statusClass = (status: ReportStatus) => 'status-' + status.toLowerCase().replaceAll(' ', '-')
function reportDate(value: string) {
  if (!value) return 'Saving…'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminDashboard({
  reports, staffEmail, loading, error, loggingOut, onBack, onLogout, onUpdateStatus,
  advisories, advisoriesLoading, advisoriesError, onCreateAdvisory, onUpdateAdvisory, onDeleteAdvisory,
  onContacts, onAdvisories,
}: AdminDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<'All' | ReportStatus>('All')
  const [barangay, setBarangay] = useState('All')
  const [severity, setSeverity] = useState<'All' | FloodSeverity>('All')
  const [page, setPage] = useState(1)
  const [pendingId, setPendingId] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateNotice, setUpdateNotice] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const editorRef = useRef<HTMLDetailsElement>(null)
  const selectedReport = reports.find(report => report.id === selectedId)
  const selectedReportId = selectedReport?.id

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (selectedReportId && !dialog.open) dialog.showModal()
    else if (!selectedReportId && dialog.open) dialog.close()
  }, [selectedReportId])

  async function changeStatus(id: string, nextStatus: ReportStatus) {
    if (pendingId) return
    setPendingId(id)
    setUpdateError('')
    setUpdateNotice('')
    try {
      await onUpdateStatus(id, nextStatus)
      setUpdateNotice('Report status saved as ' + nextStatus + '.')
    } catch {
      setUpdateError('The status was not saved. Check your connection and staff access, then try again.')
    } finally { setPendingId('') }
  }
  function resetFilters() {
    setSelectedStatus('All')
    setBarangay('All')
    setSeverity('All')
    setPage(1)
  }
  function openEditor() {
    if (!editorRef.current) return
    editorRef.current.open = true
    editorRef.current.scrollIntoView({ block: 'start', behavior: 'instant' })
    document.getElementById('manage-advisories-title')?.focus({ preventScroll: true })
  }

  const barangays = [...new Set(reports.map(report => report.barangay))].sort((a, b) => a.localeCompare(b))
  const visibleReports = reports.filter(report =>
    (selectedStatus === 'All' || report.status === selectedStatus)
    && (barangay === 'All' || report.barangay === barangay)
    && (severity === 'All' || report.severity === severity),
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalPages = Math.max(1, Math.ceil(visibleReports.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pageReports = visibleReports.slice(startIndex, startIndex + pageSize)
  const recentAdvisories = [...advisories].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
  const summaries = [
    { label: 'Total Reports', note: 'All submitted reports', icon: FaFileLines, value: reports.length, color: '' },
    { label: 'New Submissions', note: 'For initial review', icon: FaClock, value: reports.filter(r => r.status === 'Submitted').length, color: 'icon-amber' },
    { label: 'Under Review', note: 'Being assessed', icon: FaUsers, value: reports.filter(r => r.status === 'Under Review').length, color: '' },
    { label: 'Verified', note: 'Checked by staff', icon: FaShieldHalved, value: reports.filter(r => r.status === 'Verified').length, color: 'icon-green' },
    { label: 'Resolved', note: 'Marked as resolved', icon: FaCircleCheck, value: reports.filter(r => r.status === 'Resolved').length, color: '' },
  ]

  return <div className="staff-page">
    <header className="staff-hero"><div className="container staff-hero-inner">
      <div><p className="eyebrow">STAFF DASHBOARD</p><h1>Flood Report Management</h1><p>Review, verify, and update flood reports from the community.<br />Together, we keep Cainta safer and more prepared.</p></div>
      <p className="community-script">Bayanihan para sa<br />Ligtas na Cainta</p>
    </div></header>
    <div className="container staff-content">
      <section className="staff-stats" aria-label="Report summary">{summaries.map(item => <article className="panel staff-stat" key={item.label}>
        <span className={'icon-disc ' + item.color}><item.icon aria-hidden="true" /></span><div><strong>{loading || error ? '—' : item.value}</strong><h2>{item.label}</h2><p>{item.note}</p></div>
      </article>)}</section>

      <div className="staff-workspace">
        <section className="panel staff-queue" aria-labelledby="staff-queue-title">
          <div className="staff-section-heading"><div><h2 id="staff-queue-title">Incident Reports Queue</h2><p>View and manage submitted reports from the community.</p></div></div>
          <div className="staff-filters">
            <label>Filter by status<select value={selectedStatus} onChange={event => { setSelectedStatus(event.target.value as 'All' | ReportStatus); setPage(1) }}><option value="All">All Statuses</option>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Filter by barangay<select value={barangay} onChange={event => { setBarangay(event.target.value); setPage(1) }}><option value="All">All Barangays</option>{barangays.map(name => <option key={name}>{name}</option>)}</select></label>
            <label>Filter by severity<select value={severity} onChange={event => { setSeverity(event.target.value as 'All' | FloodSeverity); setPage(1) }}><option value="All">All Severities</option>{severities.map(value => <option key={value}>{value}</option>)}</select></label>
          </div>
          {updateError && <p className="form-error" role="alert">{updateError}</p>}
          {pendingId ? <p className="staff-update-notice" role="status">Saving report status…</p> : updateNotice && <p className="staff-update-notice" role="status">{updateNotice}</p>}
          {loading ? <div className="empty-reports" role="status">Loading reports…</div> : error ? <p className="form-error" role="alert">{error}</p> : visibleReports.length === 0 ? <div className="empty-reports"><span className="icon-disc"><FaFileLines aria-hidden="true" /></span><h3>{reports.length ? 'No matching reports' : 'No reports submitted yet'}</h3><p>{reports.length ? 'Try another status, barangay, or severity.' : 'Resident reports will appear here when they are submitted.'}</p>{reports.length > 0 && <button className="button button-outline" onClick={resetFilters}>Clear filters</button>}</div> : <>
            <div className="staff-table-scroll"><table className="staff-report-table"><caption className="sr-only">Community flood reports, newest first</caption><thead><tr><th scope="col">Report ID</th><th scope="col">Barangay</th><th scope="col">Location / Details</th><th scope="col">Severity</th><th scope="col">Date &amp; Time</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>
              {pageReports.map(report => <tr key={report.id}>
                <td data-label="Report ID"><span className="staff-report-id" title={report.id}>{report.id}</span></td>
                <td data-label="Barangay"><strong>{report.barangay}</strong></td>
                <td data-label="Location / Details"><span className="staff-location">{report.locationDetails}</span><span className="staff-description-preview">{report.description}</span></td>
                <td data-label="Severity"><span className={'severity-badge severity-' + report.severity.toLowerCase()}><FaWater aria-hidden="true" /> {report.severity}</span></td>
                <td data-label="Date & Time"><time dateTime={report.createdAt || undefined}>{reportDate(report.createdAt)}</time></td>
                <td data-label="Status"><select className={'staff-status-select ' + statusClass(report.status)} value={report.status} disabled={Boolean(pendingId)} aria-label={'Update report status for ' + report.id} onChange={event => void changeStatus(report.id, event.target.value as ReportStatus)}>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></td>
                <td data-label="Action"><button className="staff-view-button" onClick={() => { setSelectedId(report.id); setUpdateError(''); setUpdateNotice('') }} aria-label={'View report ' + report.id}>View</button></td>
              </tr>)}
            </tbody></table></div>
            <div className="staff-pagination"><p role="status">Showing {startIndex + 1} to {Math.min(startIndex + pageSize, visibleReports.length)} of {visibleReports.length} reports</p><nav aria-label="Report pages"><button aria-label="Previous report page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><FaChevronLeft /></button><span>Page {currentPage} of {totalPages}</span><button aria-label="Next report page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><FaChevronRight /></button></nav></div>
          </>}
        </section>

        <aside className="staff-sidebar">
          <section className="panel staff-advisory-overview"><div className="staff-section-heading"><span className="icon-disc icon-amber"><FaBullhorn aria-hidden="true" /></span><div><h2>Advisory Management</h2><p>Create and manage prototype community notices.</p></div>{onAdvisories && <button className="text-link" onClick={onAdvisories}>View all <FaArrowRight /></button>}</div>
            <button className="button button-yellow staff-create-button" onClick={openEditor}><FaCirclePlus /> Create / Manage Advisories</button>
            <h3>Recent advisories</h3>
            {advisoriesLoading ? <p role="status" className="small-note">Loading advisories…</p> : advisoriesError ? <p className="form-error" role="alert">{advisoriesError}</p> : recentAdvisories.length === 0 ? <p className="staff-no-advisories">No staff advisories yet. Create a draft to get started.</p> : <div className="staff-advisory-list">{recentAdvisories.map(advisory => {
              const Icon = categoryIcons[advisory.category]
              return <button key={advisory.id} onClick={openEditor} className="staff-advisory-row"><span className="staff-advisory-icon"><Icon aria-hidden="true" /></span><span><strong>{advisory.title}</strong><small>{advisory.category} · {reportDate(advisory.updatedAt)}</small></span><b className={advisory.isPublished ? 'published-badge' : 'draft-badge'}>{advisory.isPublished ? 'Published' : 'Draft'}</b></button>
            })}</div>}
          </section>
          <section className="panel staff-quick-contacts"><div className="staff-section-heading"><span className="icon-disc"><FaPhone aria-hidden="true" /></span><div><h2>Emergency Contacts</h2><p>Quick reference for coordination.</p></div>{onContacts && <button className="text-link" onClick={onContacts}>View all <FaArrowRight /></button>}</div><div className="staff-contact-list">
            {quickContacts.map(contact => { const number = contact.numbers[0]; return <a key={contact.id} href={'tel:' + number.dialValue}><FaPhone aria-hidden="true" /><strong>{contact.name}</strong><span>{number.display}</span></a> })}
          </div><p className="small-note">From the recorded contact directory. Reconfirm availability with the office.</p></section>
        </aside>
      </div>

      <details className="staff-editor-section" ref={editorRef}><summary><FaBullhorn aria-hidden="true" /> Advisory editor <span>Create, edit, publish, or remove notices</span></summary>
        <AdminAdvisories advisories={advisories} loading={advisoriesLoading} error={advisoriesError} onCreate={onCreateAdvisory} onUpdate={onUpdateAdvisory} onDelete={onDeleteAdvisory} />
      </details>
      <div className="staff-account-line"><button className="back-button" onClick={onBack}><FaArrowLeft /> Back to Home</button><span>Staff account: {staffEmail}</span><button className="text-link" disabled={loggingOut} onClick={() => void onLogout()}>{loggingOut ? 'Logging out…' : 'Log out'}</button></div>
    </div>

    <dialog ref={dialogRef} className="staff-report-dialog" aria-labelledby="staff-detail-title" onClose={() => setSelectedId('')}>
      {selectedReport && <><div className="staff-dialog-heading"><div><p className="eyebrow">INCIDENT DETAILS</p><h2 id="staff-detail-title">{selectedReport.barangay}</h2></div><button className="icon-button" aria-label="Close report details" onClick={() => dialogRef.current?.close()}><FaXmark /></button></div>
        <dl className="staff-detail-fields"><div><dt>Report reference</dt><dd>{selectedReport.id}</dd></div><div><dt>Detailed location</dt><dd>{selectedReport.locationDetails}</dd></div><div><dt>Submitted</dt><dd>{reportDate(selectedReport.createdAt)}</dd></div><div><dt>Severity</dt><dd><span className={'severity-badge severity-' + selectedReport.severity.toLowerCase()}>{selectedReport.severity}</span></dd></div></dl>
        <h3>Incident description</h3><p className="report-description">{selectedReport.description}</p>
        {selectedReport.photoPath ? <ReportEvidence photoPath={selectedReport.photoPath} photoName={selectedReport.photoName} alt={'Evidence submitted for ' + selectedReport.locationDetails} /> : <p className="small-note">No stored evidence photo is attached to this report.</p>}
        <label className="staff-detail-status">Update report status<select className={'staff-status-select ' + statusClass(selectedReport.status)} value={selectedReport.status} disabled={Boolean(pendingId)} onChange={event => void changeStatus(selectedReport.id, event.target.value as ReportStatus)}>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></label>
        {updateError && <p className="form-error" role="alert">{updateError}</p>}{pendingId ? <p role="status">Saving status…</p> : updateNotice && <p role="status" className="staff-update-notice">{updateNotice}</p>}
      </>}
    </dialog>
  </div>
}
