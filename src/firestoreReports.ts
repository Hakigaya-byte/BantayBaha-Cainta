import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { FloodReport, FloodReportInput, ReportStatus } from './report'

const reportsCollection = collection(db, 'floodReports')
const residentStorageKey = 'bantaybaha-resident-id'

function createResidentId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `resident-${Date.now()}`
}

export function getCurrentResidentId() {
  const savedResidentId = localStorage.getItem(residentStorageKey)

  if (savedResidentId) {
    return savedResidentId
  }

  const residentId = createResidentId()
  localStorage.setItem(residentStorageKey, residentId)
  return residentId
}

export async function createFloodReport(reportInput: FloodReportInput) {
  const createdAt = new Date().toISOString()

  await addDoc(reportsCollection, {
    ...reportInput,
    residentId: getCurrentResidentId(),
    status: 'Submitted' satisfies ReportStatus,
    staffNote: '',
    createdAt,
    updatedAt: createdAt,
  })
}

export function subscribeToFloodReports(
  onReportsChanged: (reports: FloodReport[]) => void,
  onError: (error: Error) => void,
) {
  const reportsQuery = query(reportsCollection, orderBy('createdAt', 'desc'))

  return onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDocument) => ({
        id: reportDocument.id,
        ...(reportDocument.data() as Omit<FloodReport, 'id'>),
      }))

      onReportsChanged(reports)
    },
    onError,
  )
}

export async function updateFloodReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  await updateDoc(doc(db, 'floodReports', reportId), {
    status,
    updatedAt: new Date().toISOString(),
  })
}
