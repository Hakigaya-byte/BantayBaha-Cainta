import { useMemo, useState } from 'react'
import type { FloodReport } from '../report'
import { validCoordinates } from '../reportLocation'
import MapView from './MapView'

export default function StaffReportMap({ reports, onSelect }: { reports: FloodReport[]; onSelect: (id: string) => void }) {
  const [show, setShow] = useState(false)
  const points = useMemo(() => reports.filter(report => validCoordinates(report.coordinates)).map(report => ({
    id: report.id, coordinates: report.coordinates!, label: report.barangay,
    description: report.locationDetails, severity: report.severity, status: report.status,
  })), [reports])
  const missing = reports.length - points.length
  return <section className="staff-report-map" aria-labelledby="staff-report-map-title">
    <div className="report-map-heading"><div><h3 id="staff-report-map-title">Report locations</h3><p>{points.length} mapped · {missing} without a map location</p></div><button type="button" className="button button-outline" aria-expanded={show} onClick={() => setShow(value => !value)}>{show ? 'Hide report map' : 'Show report map'}</button></div>
    <p className="small-note">Uses the status, barangay, and severity filters above. Includes all matching reports, not just the current table page.</p>
    {missing > 0 && <p className="small-note">Reports without saved coordinates remain in the queue. No location is guessed from an address or barangay.</p>}
    {show && <><div className="report-map-legend"><span className="severity-badge severity-low">Low</span><span className="severity-badge severity-medium">Medium</span><span className="severity-badge severity-high">High</span></div>{points.length ? <MapView points={points} onSelect={onSelect} /> : <p className="report-map-placeholder">No mapped reports match these filters yet.</p>}<p className="small-note">Select a pin to view its report. Reports at the same location share a pin, showing the highest reported severity. Resident-selected pins are not automatically verified.</p></>}
  </section>
}
