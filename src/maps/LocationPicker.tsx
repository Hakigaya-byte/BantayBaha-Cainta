import { useEffect, useMemo, useRef, useState } from 'react'
import { FaLocationCrosshairs, FaMapLocationDot } from 'react-icons/fa6'
import { coordinateLabel, manualCoordinates, requestCurrentLocation, validCoordinates, type ReportCoordinates } from '../reportLocation'
import MapView from './MapView'

type Props = { value: ReportCoordinates | null; confirmed: boolean; disabled: boolean; onChange: (point: ReportCoordinates | null) => void; onConfirm: (confirmed: boolean) => void }
export default function LocationPicker({ value, confirmed, disabled, onChange, onConfirm }: Props) {
  const [showMap, setShowMap] = useState(false)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const cancelRequest = useRef<(() => void) | null>(null)
  const mapArea = useRef<HTMLDivElement>(null)
  const points = useMemo(() => value ? [{ id: 'incident', coordinates: value, label: 'Selected incident location' }] : [], [value])
  useEffect(() => () => { cancelRequest.current?.() }, [])
  useEffect(() => { if (disabled) cancelRequest.current?.() }, [disabled])
  // Submission cancels an in-flight reading; don't leave the button waiting after a failed save.
  if (disabled && locating) setLocating(false)

  function skipMap() {
    cancelRequest.current?.(); setLocating(false); setShowMap(false)
    onChange(null); onConfirm(false); setLatitude(''); setLongitude('')
    setMessage('Map skipped. You can submit using your barangay and detailed location.')
  }

  function pick(point: ReportCoordinates) {
    cancelRequest.current?.(); setLocating(false)
    onChange(point); onConfirm(false); setShowMap(true); setMessage('Pin selected. Check the map and confirm that this is where the flooding occurred.')
  }
  function locate() {
    cancelRequest.current?.()
    onConfirm(false)
    setMessage('')
    if (!window.isSecureContext || !navigator.geolocation) { setMessage('Location detection is not available in this browser. Please choose the pin manually.'); return }
    setLocating(true)
    try {
      cancelRequest.current = requestCurrentLocation(navigator.geolocation, point => pick(point), error => { setLocating(false); setMessage(error) })
    } catch { setLocating(false); setMessage('Location detection could not start. Choose the incident location manually.') }
  }
  return <section className="location-picker" aria-labelledby="incident-map-title">
    <h3 id="incident-map-title">Incident location on map (optional)</h3>
    <p>You can submit using your barangay and detailed location without a map pin, especially on a slow connection.</p>
    <p>Choose where the flooding happened, not necessarily where you are now. Your pin is shared only with your account and authorized staff.</p>
    <div className="report-map-actions"><button type="button" className="button button-blue" disabled={disabled || locating} onClick={locate}><FaLocationCrosshairs aria-hidden="true" />{locating ? 'Finding location…' : 'Use my current location'}</button><button type="button" className="button button-outline" disabled={disabled} onClick={() => {
      cancelRequest.current?.(); setLocating(false); setShowMap(true); setMessage('Click or tap the map to place a pin. You can drag the pin to adjust it.');
      requestAnimationFrame(() => mapArea.current?.focus({ preventScroll: true }))
    }}><FaMapLocationDot aria-hidden="true" />Choose on map</button></div>
    <p className="small-note">Uses your location once, only when requested. No background tracking. The browser may ask for permission.</p>
    {locating && <p role="status">Waiting for location permission or a device position… You can choose the map manually instead.</p>}
    {message && <p className="location-picker-message" role="status">{message}</p>}
    {showMap && <div ref={mapArea} tabIndex={-1}><MapView points={points} picker disabled={disabled} onPick={pick} /><p className="small-note">Keyboard: focus the map, use arrow keys to pan and +/− to zoom, then select “Place pin at map center.”</p></div>}
    <details className="map-coordinate-fallback"><summary>Enter coordinates manually (if the map cannot load)</summary><div className="coordinate-inputs"><label>Latitude<input type="text" inputMode="decimal" value={latitude} onChange={event => setLatitude(event.target.value)} /></label><label>Longitude<input type="text" inputMode="decimal" value={longitude} onChange={event => setLongitude(event.target.value)} /></label><button type="button" className="button button-outline" disabled={disabled} onClick={() => {
      const point = manualCoordinates(Number(latitude), Number(longitude))
      if (!latitude.trim() || !longitude.trim() || !validCoordinates(point)) { setMessage('Enter a valid latitude (−90 to 90) and longitude (−180 to 180).'); return }
      pick(point)
    }}>Use coordinates</button></div></details>
    {value && <div className="location-selected"><p><strong>Selected pin:</strong> {coordinateLabel(value)}</p>{value.source === 'device' && <p>Device estimate: about ±{Math.ceil(value.accuracyMeters ?? 0)} metres. {Number(value.accuracyMeters) > 100 ? 'This is a broad estimate—adjust the pin before confirming.' : 'Check and adjust the pin if needed.'}</p>}</div>}
    {value && <label className="location-confirm"><input type="checkbox" checked={confirmed} required disabled={disabled || locating} onChange={event => onConfirm(event.target.checked)} /><span>I confirm that this pin marks the flood incident location.</span></label>}
    {(value || showMap || locating || latitude || longitude || message) && <button type="button" className="text-link" disabled={disabled} onClick={skipMap}>Skip map / remove pin</button>}
  </section>
}
