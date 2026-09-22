import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Advisory, AdvisoryInput } from './data/advisories'

const advisoriesCollection = collection(db, 'advisories')

export function advisoryLoadError(error: Error): string {
  const code = 'code' in error ? String(error.code) : ''
  if (code === 'permission-denied') return 'Published advisories are unavailable because database access is not configured. Please contact the project administrator.'
  if (code === 'unavailable') return 'Unable to connect to published advisories. Check your connection and try again.'
  return 'Published advisories could not be loaded. Please try again or check official local channels.'
}

function dateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return typeof value === 'string' ? value : ''
}

function cleanInput(input: AdvisoryInput): AdvisoryInput {
  const title = input.title.trim()
  const summary = input.summary.trim()
  if (!title || !summary) throw new Error('Advisory title and details are required.')
  return { ...input, title, summary }
}

export function subscribeToAdvisories(
  includeDrafts: boolean,
  onAdvisoriesChanged: (advisories: Advisory[]) => void,
  onError: (error: Error) => void,
) {
  const advisoriesQuery = includeDrafts
    ? query(advisoriesCollection)
    : query(advisoriesCollection, where('isPublished', '==', true))

  return onSnapshot(advisoriesQuery, (snapshot) => {
    const advisories = snapshot.docs.map((advisoryDocument) => {
      const data = advisoryDocument.data()
      return {
        ...data,
        id: advisoryDocument.id,
        publishedAt: dateString(data.publishedAt),
        createdAt: dateString(data.createdAt),
        updatedAt: dateString(data.updatedAt),
        isSample: false,
      } as Advisory
    })
    onAdvisoriesChanged(advisories.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)))
  }, error => {
    // Log the code for diagnosis without logging advisory content or account data.
    console.error('Advisories subscription failed', { code: error.code })
    onError(error)
  })
}

export async function createAdvisory(input: AdvisoryInput) {
  if (!auth.currentUser) throw new Error('Staff sign-in is required.')
  const clean = cleanInput(input)
  return addDoc(advisoriesCollection, {
    ...clean,
    publishedAt: clean.isPublished ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateAdvisory(advisoryId: string, input: AdvisoryInput) {
  if (!auth.currentUser) throw new Error('Staff sign-in is required.')
  const clean = cleanInput(input)
  await updateDoc(doc(db, 'advisories', advisoryId), {
    ...clean,
    publishedAt: clean.isPublished ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteAdvisory(advisoryId: string) {
  if (!auth.currentUser) throw new Error('Staff sign-in is required.')
  await deleteDoc(doc(db, 'advisories', advisoryId))
}
