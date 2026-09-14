import { useState } from 'react'
import type { FloodReport, ReportStatus } from './report'

type AdminDashboardProps = {
  reports: FloodReport[]
  onBack: () => void
  onUpdateStatus: (reportId: string, newStatus: ReportStatus) => void
}

const statusOptions: ReportStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Resolved',
  'Closed',
]

function AdminDashboard({
  reports,
  onBack,
  onUpdateStatus,
}: AdminDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<'All' | ReportStatus>('All')

  const visibleReports =
    selectedStatus === 'All'
      ? reports
      : reports.filter((report) => report.status === selectedStatus)

  const submittedCount = reports.filter(
    (report) => report.status === 'Submitted',
  ).length

  const underReviewCount = reports.filter(
    (report) => report.status === 'Under Review',
  ).length

  const resolvedCount = reports.filter(
    (report) => report.status === 'Resolved',
  ).length

  return (
    <main className="admin-page">
      <section className="admin-dashboard">
        <div className="admin-header">
          <div>
            <button className="back-button" onClick={onBack}>
              ← Back to Home
            </button>

            <p className="eyebrow report-eyebrow">DRRMO STAFF DEMO</p>
            <h1>Flood report dashboard</h1>
            <p>
              Review submitted reports and update their current status.
            </p>
          </div>

          <div className="admin-badge">Admin Mode</div>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
          </article>

          <article className="summary-card">
            <span>Submitted</span>
            <strong>{submittedCount}</strong>
          </article>

          <article className="summary-card">
            <span>Under Review</span>
            <strong>{underReviewCount}</strong>
          </article>

          <article className="summary-card">
            <span>Resolved</span>
            <strong>{resolvedCount}</strong>
          </article>
        </div>

        <div className="dashboard-toolbar">
          <div>
            <h2>Incident Reports</h2>
            <p>{visibleReports.length} report(s) shown</p>
          </div>

          <label className="filter-control">
            Filter by status
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as 'All' | ReportStatus)
              }
            >
              <option value="All">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visibleReports.length === 0 ? (
          <div className="empty-reports">
            <span>📭</span>
            <h2>No reports found.</h2>
            <p>There are no reports under this selected status.</p>
          </div>
        ) : (
          <div className="admin-report-list">
            {visibleReports.map((report) => (
              <article className="admin-report-card" key={report.id}>
                <div className="report-item-top">
                  <div>
                    <p className="report-barangay">{report.barangay}</p>
                    <p className="report-location">{report.locationDetails}</p>
                  </div>

                  <span
                    className={`status-badge status-${report.status
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="report-details">
                  <span>
                    Severity: <strong>{report.severity}</strong>
                  </span>
                  <span>Submitted: {report.createdAt}</span>
                </div>

                <p className="report-description">{report.description}</p>

                <label className="admin-status-control">
                  Update report status
                  <select
                    value={report.status}
                    onChange={(event) =>
                      onUpdateStatus(
                        report.id,
                        event.target.value as ReportStatus,
                      )
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard