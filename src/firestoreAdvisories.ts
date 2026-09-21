import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Advisory, AdvisoryInput } from './data/advisories'

const advisoriesCollection = collection(db, 'advisories')

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
  }, onError)
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
