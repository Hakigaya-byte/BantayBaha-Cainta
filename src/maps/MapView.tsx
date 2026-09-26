import { useEffect, useState, type ComponentType } from 'react'
import type { ReportCoordinates } from '../reportLocation'
import './ReportMap.css'

export type MapPoint = {
  id: string
  coordinates: ReportCoordinates
  label: string
  description?: string
  severity?: string
  status?: string
}
export type MapViewProps = {
  points: MapPoint[]
  picker?: boolean
  disabled?: boolean
  onPick?: (point: ReportCoordinates) => void
  onSelect?: (id: string) => void
}

export default function MapView(props: MapViewProps) {
  const [Canvas, setCanvas] = useState<ComponentType<MapViewProps> | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    import('./MapCanvas').then(module => { if (active) setCanvas(() => module.default) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [attempt])
  if (failed) return <div className="report-map-placeholder" role="alert"><p>The map could not be loaded. Your report fields are still available.</p><button type="button" className="button button-outline" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Retry map</button></div>
  return Canvas ? <Canvas {...props} /> : <div className="report-map-placeholder" role="status">Loading map…</div>
}
