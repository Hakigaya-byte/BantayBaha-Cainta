import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { FloodReport, FloodReportInput, ReportStatus } from './report'

const reportsCollection = collection(db, 'floodReports')
function dateString(value: unknown): string {
  // Older demonstration reports used ISO strings instead of server timestamps.
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return typeof value === 'string' ? value : ''
}

export async function createFloodReport(input: FloodReportInput) {
  const user = auth.currentUser
  if (!user) throw new Error('Sign in before submitting a report.')
  const barangay = input.barangay.trim()
  const locationDetails = input.locationDetails.trim()
  const description = input.description.trim()
  if (!barangay || !locationDetails || !description) throw new Error('Please fill in all required fields.')
  return addDoc(reportsCollection, {
    barangay, locationDetails, description,
    severity: input.severity,
    photoName: input.photoName,
    residentId: user.uid,
    status: 'Submitted' satisfies ReportStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToFloodReports(
  uid: string,
  isStaff: boolean,
  onReportsChanged: (reports: FloodReport[]) => void,
  onError: (error: Error) => void,
) {
  // Owner restriction is sent to Firestore; private records are never downloaded
  // and filtered in the browser. Sort the small prototype list locally.
  const reportsQuery = isStaff ? query(reportsCollection)
    : query(reportsCollection, where('residentId', '==', uid))

  return onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDocument) => {
        const data = reportDocument.data()
        return { ...data, id: reportDocument.id, createdAt: dateString(data.createdAt) } as FloodReport
      })
      onReportsChanged(reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    },
    onError,
  )
}

export async function updateFloodReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  if (!auth.currentUser) throw new Error('Sign in before updating a report.')
  // Firestore checks staff permission for every write.
  await updateDoc(doc(db, 'floodReports', reportId), {
    status,
    updatedAt: serverTimestamp(),
  })
}
