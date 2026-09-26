import { FirebaseError } from 'firebase/app'
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import { deleteObject, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from './firebase'
import { evidenceUploadsEnabled } from './reportFeatures'
import { validCoordinates } from './reportLocation'
import { evidencePhotoError, type CreateFloodReportResult, type FloodReport, type FloodReportInput, type ReportStatus } from './report'

const reportsCollection = collection(db, 'floodReports')
function dateString(value: unknown): string {
  // Older demonstration reports used ISO strings instead of server timestamps.
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return typeof value === 'string' ? value : ''
}

export async function createFloodReport(input: FloodReportInput): Promise<CreateFloodReportResult> {
  const user = auth.currentUser
  if (!user) throw new FirebaseError('unauthenticated', 'Sign in before submitting a report.')
  const barangay = input.barangay.trim()
  const locationDetails = input.locationDetails.trim()
  const description = input.description.trim()
  if (!barangay || !locationDetails || !description) throw new Error('Please fill in all required fields.')
  if (input.coordinates !== null && !validCoordinates(input.coordinates)) throw new Error('Choose a valid incident location, or skip the map.')
  if (input.photo) {
    const photoError = evidencePhotoError(input.photo)
    if (photoError) throw new Error(photoError)
  }

  const reportReference = doc(reportsCollection)
  await setDoc(reportReference, {
    barangay, locationDetails, description,
    severity: input.severity,
    // Rules accept an absent optional location, not a null coordinate object.
    ...(input.coordinates !== null ? { coordinates: input.coordinates } : {}),
    photoName: '',
    // Keep the initial record compatible with the currently published rules.
    // photoPath is added only after a successful optional upload; reads normalize
    // its absence to ''. Do not retry permission failures with weakened rules.
    residentId: user.uid,
    status: 'Submitted' satisfies ReportStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (!input.photo) {
    return { reportId: reportReference.id, photoUploaded: false, warning: '' }
  }

  if (!evidenceUploadsEnabled) {
    return {
      reportId: reportReference.id,
      photoUploaded: false,
      warning: 'Your report details were saved. The selected photo was not attached because photo upload is not enabled for this prototype yet. You do not need to submit the report again.',
    }
  }

  const photoPath = `reportEvidence/${user.uid}/${reportReference.id}/evidence`
  let photoUploaded = false

  try {
    const photoReference = ref(storage, photoPath)
    await uploadBytes(photoReference, input.photo, {
      contentType: input.photo.type,
      customMetadata: { reportId: reportReference.id, ownerId: user.uid },
    })
    photoUploaded = true
    await updateDoc(reportReference, {
      photoName: input.photo.name.slice(0, 255),
      photoPath,
      updatedAt: serverTimestamp(),
    })
    return { reportId: reportReference.id, photoUploaded: true, warning: '' }
  } catch (error) {
    console.warn('Report saved, but optional photo attachment failed', error)
    if (photoUploaded) await deleteObject(ref(storage, photoPath)).catch(() => undefined)
    return {
      reportId: reportReference.id,
      photoUploaded: false,
      warning: 'Your report was saved, but the optional photo could not be uploaded. The report is still valid.',
    }
  }
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
        return {
          ...data,
          id: reportDocument.id,
          createdAt: dateString(data.createdAt),
          photoName: typeof data.photoName === 'string' ? data.photoName : '',
          photoPath: typeof data.photoPath === 'string' ? data.photoPath : '',
          coordinates: validCoordinates(data.coordinates) ? data.coordinates : null,
        } as FloodReport
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
