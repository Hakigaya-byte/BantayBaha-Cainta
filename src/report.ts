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
  photoName: string
}

export type FloodReport = FloodReportInput & {
  id: string
  residentId: string
  status: ReportStatus
  staffNote: string
  createdAt: string
}