import type { ReportCoordinates } from './reportLocation'

export type ReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Resolved'
  | 'Closed'

export type FloodSeverity = 'Low' | 'Medium' | 'High'

export type FloodReportInput = {
  barangay: string
  locationDetails: string
  severity: FloodSeverity
  description: string
  photo: File | null
  coordinates: ReportCoordinates | null
}

export type FloodReport = Omit<FloodReportInput, 'photo'> & {
  id: string
  residentId: string
  status: ReportStatus
  createdAt: string
  photoName: string
  photoPath: string
}

export type CreateFloodReportResult = {
  reportId: string
  photoUploaded: boolean
  warning: string
}

export const MAX_EVIDENCE_PHOTO_BYTES = 5 * 1024 * 1024
export const ALLOWED_EVIDENCE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function reportSubmissionError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Your report was not saved because the database rejected it. Please contact the project administrator to check the Firestore rules (permission-denied). Your entries are still here.'
  }
  if (code === 'unauthenticated' || code.startsWith('auth/')) {
    return 'Your sign-in session could not be verified. Please sign in again before submitting your report.'
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'The database could not confirm the save. Check your connection, then check My Reports before trying again to avoid a duplicate.'
  }
  if (code === 'resource-exhausted') {
    return 'The database has reached its usage limit. Please contact the project administrator and try again later.'
  }
  return 'Your report could not be saved. Your entries are still here. Please try again; if it continues, send the project administrator the browser console error.'
}

export function evidencePhotoError(file: File): string {
  if (!ALLOWED_EVIDENCE_PHOTO_TYPES.includes(file.type as typeof ALLOWED_EVIDENCE_PHOTO_TYPES[number])) {
    return 'Choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_EVIDENCE_PHOTO_BYTES) {
    return 'The photo must be 5 MB or smaller.'
  }
  return ''
}
