export type ReportCoordinates = {
  latitude: number
  longitude: number
  source: 'device' | 'manual'
  accuracyMeters: number | null
}

// Starting viewport only, never an automatically assigned report location.
export const CAINTA_MAP_CENTER: [number, number] = [14.578, 121.122]

export function validCoordinates(value: unknown): value is ReportCoordinates {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return Object.keys(point).length === 4
    && typeof point.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180
    && ((point.source === 'manual' && point.accuracyMeters === null)
      || (point.source === 'device' && typeof point.accuracyMeters === 'number'
        && Number.isFinite(point.accuracyMeters) && point.accuracyMeters >= 0 && point.accuracyMeters <= 20000000))
}

export function manualCoordinates(latitude: number, longitude: number): ReportCoordinates {
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)), source: 'manual', accuracyMeters: null }
}

export function coordinateLabel(point: ReportCoordinates): string {
  return `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
}

export function locationError(code: number): string {
  if (code === 1) return 'Location permission was denied. Allow it in your browser settings, or choose the incident location manually.'
  if (code === 3) return 'Location detection timed out. Try again or choose a pin manually.'
  return 'Your device location could not be found. Check location settings or choose a pin manually.'
}

// Cancel ignores late responses; it does not keep watching the user's position.
export function requestCurrentLocation(
  api: Pick<Geolocation, 'getCurrentPosition'>,
  onSuccess: (point: ReportCoordinates) => void,
  onError: (message: string) => void,
): () => void {
  let active = true
  api.getCurrentPosition(position => {
    if (!active) return
    active = false
    const point: ReportCoordinates = {
      latitude: position.coords.latitude, longitude: position.coords.longitude,
      source: 'device', accuracyMeters: position.coords.accuracy,
    }
    if (validCoordinates(point)) onSuccess(point)
    else onError('The device returned an invalid position. Please choose a pin manually.')
  }, error => {
    if (!active) return
    active = false
    onError(locationError(error.code))
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
  return () => { active = false }
}
