import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import markerUrl from 'leaflet/dist/images/marker-icon.png'
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { CAINTA_MAP_CENTER, manualCoordinates } from '../reportLocation'
import type { MapPoint, MapViewProps } from './MapView'

export default function MapCanvas({ points, picker = false, disabled = false, onPick, onSelect }: MapViewProps) {
  const element = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const previousPositions = useRef('')
  const actions = useRef({ disabled, onPick, onSelect })
  const [tileError, setTileError] = useState(false)
  useEffect(() => { actions.current = { disabled, onPick, onSelect } }, [disabled, onPick, onSelect])

  useEffect(() => {
    if (!element.current) return
    const map = L.map(element.current, { scrollWheelZoom: false, maxZoom: 19, minZoom: 2, worldCopyJump: true })
      .setView(CAINTA_MAP_CENTER, 13)
    mapRef.current = map
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map)
    tileRef.current = tiles
    tiles.on('tileerror', () => setTileError(true))
    layerRef.current = L.layerGroup().addTo(map)
    map.on('click', (event: L.LeafletMouseEvent) => {
      if (!actions.current.disabled) actions.current.onPick?.(manualCoordinates(event.latlng.lat, event.latlng.wrap().lng))
    })
    // Preserve the geographic center when CSS finishes loading or the viewport changes.
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(element.current)
    return () => { observer.disconnect(); map.remove(); mapRef.current = null; layerRef.current = null; previousPositions.current = '' }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    // Multiple incidents at the same coordinates share a pin, never hide reports.
    const groups = new Map<string, MapPoint[]>()
    points.forEach(point => {
      const key = `${point.coordinates.latitude},${point.coordinates.longitude}`
      groups.set(key, [...(groups.get(key) ?? []), point])
    })
    groups.forEach(group => {
      const first = group[0]
      const color = group.some(point => point.severity === 'High') ? 'high' : group.some(point => point.severity === 'Medium') ? 'medium' : 'low'
      const title = group.length > 1 ? `${group.length} reports at this location` : `${first.label}${first.severity ? ` — ${first.severity}` : ''}`
      const icon = L.icon({ iconUrl: markerUrl, iconRetinaUrl: markerRetinaUrl, shadowUrl,
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41], className: picker ? '' : `report-map-pin-${color}` })
      const marker = L.marker([first.coordinates.latitude, first.coordinates.longitude], { icon, draggable: picker && !disabled, title, alt: title, keyboard: true }).addTo(layer)
      if (picker) {
        marker.on('dragend', () => {
          const location = marker.getLatLng().wrap()
          if (!actions.current.disabled) actions.current.onPick?.(manualCoordinates(location.lat, location.lng))
        })
      } else {
        const popup = document.createElement('div')
        popup.className = 'report-map-popup'
        group.forEach(point => {
          const item = document.createElement('div')
          const heading = document.createElement('strong')
          heading.textContent = point.label
          item.append(heading)
          for (const text of [point.description, [point.severity, point.status].filter(Boolean).join(' · ')]) {
            if (!text) continue
            const line = document.createElement('p'); line.textContent = text; item.append(line)
          }
          if (actions.current.onSelect) {
            const button = document.createElement('button')
            button.type = 'button'; button.textContent = 'View report details'
            button.onclick = () => actions.current.onSelect?.(point.id)
            item.append(button)
          }
          popup.append(item)
        })
        marker.bindPopup(popup, { maxWidth: 300, maxHeight: 240 })
      }
    })
    const positions = [...groups.keys()].sort().join('|')
    if (positions !== previousPositions.current) {
      previousPositions.current = positions
      if (points.length) map.fitBounds(L.latLngBounds(points.map(point => [point.coordinates.latitude, point.coordinates.longitude] as [number, number])), { padding: [35, 35], maxZoom: 16, animate: false })
      else map.setView(CAINTA_MAP_CENTER, 13, { animate: false })
    }
  }, [points, picker, disabled])

  return <div className="report-map-view">
    <div className="report-map-canvas" ref={element} role="region" aria-label={picker ? 'Choose flood incident location on the map' : 'Flood report locations map'} />
    {tileError && <p className="form-warning" role="status">Some map tiles could not load. Try again or use the address/coordinate fields. <button type="button" onClick={() => { setTileError(false); tileRef.current?.redraw() }}>Reload map tiles</button></p>}
    {picker && <button type="button" className="button button-outline map-center-button" disabled={disabled} onClick={() => {
      const center = mapRef.current?.getCenter().wrap()
      if (center) onPick?.(manualCoordinates(center.lat, center.lng))
    }}>Place pin at map center</button>}
    <p className="report-map-credit">Base map: OpenStreetMap. Map viewing sends your IP and the viewed map area to the tile provider; report text and account details are not sent. <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">Report a base-map issue</a></p>
  </div>
}
