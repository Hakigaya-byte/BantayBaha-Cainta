import { useMemo, useState } from 'react'
import { coordinateLabel, validCoordinates, type ReportCoordinates } from '../reportLocation'
import MapView from './MapView'

export default function ReportLocation({ coordinates, label }: { coordinates: ReportCoordinates | null; label: string }) {
  const [show, setShow] = useState(false)
  const valid = validCoordinates(coordinates)
  const points = useMemo(() => valid && coordinates ? [{ id: 'saved-location', coordinates, label }] : [], [coordinates, label, valid])
  if (!valid) return <p className="small-note">No map location was recorded for this report. Use its detailed address and landmark.</p>
  return <section className="saved-report-location"><h3>Incident map location</h3><p className="small-note">{coordinateLabel(coordinates)} · Resident-selected location, not automatically verified.</p><button type="button" className="button button-outline" aria-expanded={show} onClick={() => setShow(value => !value)}>{show ? 'Hide location map' : 'View location on map'}</button>{show && <MapView points={points} />}</section>
}
