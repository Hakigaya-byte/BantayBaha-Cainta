import type { FloodReport } from './report'

type MyReportsProps = {
  reports: FloodReport[]
  loading: boolean
  error: string
  onBack: () => void
}

function MyReports({ reports, loading, error, onBack }: MyReportsProps) {
  return (
    <main className="report-page">
      <section className="my-reports-card">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>

        <p className="eyebrow report-eyebrow">MY REPORTS</p>
        <h1>Submitted flood reports</h1>

        <p className="report-intro">
          This page shows the reports submitted by the current resident.
        </p>

        {loading ? <p role="status">Loading your reports…</p> : error ? <p role="alert" className="form-error">{error}</p> : reports.length === 0 ? (
          <div className="empty-reports">
            <span>📭</span>
            <h2>No reports yet.</h2>
            <p>You have not submitted a flood incident report.</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <article className="report-item" key={report.id}>
                <div className="report-item-top">
                  <div>
                    <p className="report-barangay">{report.barangay}</p>
                    <p className="report-location">{report.locationDetails}</p>
                  </div>

                  <span className={`status-badge status-${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                </div>

                <div className="report-details">
                  <span>Severity: <strong>{report.severity}</strong></span>
                  <span>Submitted: {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Saving…'}</span>
                </div>

                <p className="report-description">{report.description}</p>

                {report.photoName && (
                  <p className="photo-note">Selected filename: {report.photoName} (image upload is not available yet)</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default MyReports
