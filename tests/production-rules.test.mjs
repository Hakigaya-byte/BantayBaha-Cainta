import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, setLogLevel, updateDoc, where } from 'firebase/firestore'

let env
setLogLevel('silent')
const advisory = (isPublished = false) => ({
  category: 'Community', title: 'LOCAL TEST ONLY', summary: 'Not a real announcement.',
  isPublished, publishedAt: isPublished ? serverTimestamp() : null,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
})
const report = () => ({
  residentId: 'ana', barangay: 'San Andres', locationDetails: 'LOCAL TEST road',
  severity: 'Low', description: 'Not a real incident.', photoName: '', status: 'Submitted',
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
})
const signedIn = (uid) => env.authenticatedContext(uid).firestore()
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-bantaybaha', firestore: {
    host: '127.0.0.1', port: 8080,
    rules: await readFile(new URL('../firestore.production.rules', import.meta.url), 'utf8'),
  } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore()
    await Promise.all([
      setDoc(doc(db, 'staff', 'staff-user'), { active: true }),
      setDoc(doc(db, 'staff', 'inactive-staff'), { active: false }),
      setDoc(doc(db, 'advisories', 'published'), advisory(true)),
      setDoc(doc(db, 'advisories', 'draft'), advisory()),
      setDoc(doc(db, 'floodReports', 'ana-report'), report()),
    ])
  })
})
after(async () => { await env?.cleanup() })

test('production: guests and residents can read only published advisories', async () => {
  for (const db of [env.unauthenticatedContext().firestore(), signedIn('ana'), signedIn('inactive-staff')]) {
    const results = await assertSucceeds(getDocs(query(collection(db, 'advisories'), where('isPublished', '==', true))))
    assert.deepEqual(results.docs.map(item => item.id), ['published'])
    await assertSucceeds(getDoc(doc(db, 'advisories', 'published')))
    await assertFails(getDoc(doc(db, 'advisories', 'draft')))
    await assertFails(getDocs(collection(db, 'advisories')))
    await assertFails(setDoc(doc(db, 'advisories', 'unauthorized'), advisory(true)))
    await assertFails(updateDoc(doc(db, 'advisories', 'published'), { title: 'Unauthorized change' }))
    await assertFails(deleteDoc(doc(db, 'advisories', 'published')))
  }
})

test('production: active staff can create, publish, unpublish and delete advisories', async () => {
  const db = signedIn('staff-user')
  assert.equal((await assertSucceeds(getDocs(collection(db, 'advisories')))).size, 2)
  const ref = doc(db, 'advisories', 'new')
  await assertSucceeds(setDoc(ref, advisory()))
  await assertSucceeds(updateDoc(ref, { isPublished: true, publishedAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  await assertSucceeds(updateDoc(ref, { isPublished: false, publishedAt: null, updatedAt: serverTimestamp() }))
  await assertSucceeds(deleteDoc(ref))
  for (const extra of [{ category: 'Invalid' }, { title: '  ' }, { summary: 'a'.repeat(1501) }, { privateNote: 'Forbidden field' }, { publishedAt: null }]) {
    await assertFails(setDoc(ref, { ...advisory(true), ...extra }))
  }
})

test('production: private reports and staff membership permissions remain restricted', async () => {
  const guest = env.unauthenticatedContext().firestore()
  const ana = signedIn('ana')
  const ben = signedIn('ben')
  const staff = signedIn('staff-user')
  await assertFails(getDoc(doc(guest, 'floodReports', 'ana-report')))
  await assertFails(getDoc(doc(ben, 'floodReports', 'ana-report')))
  await assertSucceeds(getDoc(doc(ana, 'floodReports', 'ana-report')))
  await assertSucceeds(getDoc(doc(staff, 'floodReports', 'ana-report')))
  await assertSucceeds(setDoc(doc(ana, 'floodReports', 'new'), report()))
  await assertFails(getDocs(collection(ana, 'floodReports')))
  await assertSucceeds(getDocs(query(collection(ana, 'floodReports'), where('residentId', '==', 'ana'))))
  await assertFails(updateDoc(doc(ana, 'floodReports', 'ana-report'), { status: 'Resolved', updatedAt: serverTimestamp() }))
  await assertSucceeds(updateDoc(doc(staff, 'floodReports', 'ana-report'), { status: 'Resolved', updatedAt: serverTimestamp() }))
  await assertFails(deleteDoc(doc(staff, 'floodReports', 'ana-report')))
  await assertFails(setDoc(doc(ana, 'staff', 'ana'), { active: true }))
  await assertFails(getDocs(collection(ana, 'staff')))
  // The coordinate rollout does not enable the future photo rule rollout.
  await assertFails(setDoc(doc(ana, 'floodReports', 'with-photo-path'), { ...report(), photoPath: '' }))
})

test('production: coordinate schema validates both manual pins and device estimates', async () => {
  const db = signedIn('ana')
  const point = { latitude: 14.578, longitude: 121.122, source: 'manual', accuracyMeters: null }
  for (const [i, coordinates] of [point, { ...point, latitude: 0, longitude: 0 }, { ...point, source: 'device', accuracyMeters: 40 }].entries()) {
    const ref = doc(db, 'floodReports', 'mapped-' + i)
    await assertSucceeds(setDoc(ref, { ...report(), coordinates }))
    assert.deepEqual((await getDoc(ref)).data().coordinates, coordinates)
  }
  for (const coordinates of [null, {}, { ...point, latitude: 91 }, { ...point, longitude: 181 }, { ...point, latitude: NaN }, { ...point, longitude: Infinity }, { ...point, latitude: '14.578' }, { ...point, source: 'fake' }, { ...point, accuracyMeters: 2 }, { ...point, source: 'device', accuracyMeters: -1 }, { ...point, source: 'device', accuracyMeters: 20000001 }, { ...point, extra: true }]) {
    await assertFails(setDoc(doc(db, 'floodReports', 'bad-point'), { ...report(), coordinates }))
  }
})

test('production: mapped reports stay private and coordinates cannot be changed after submission', async () => {
  const point = { latitude: 14.578, longitude: 121.122, source: 'manual', accuracyMeters: null }
  const ana = signedIn('ana'), staff = signedIn('staff-user')
  await assertSucceeds(setDoc(doc(ana, 'floodReports', 'mapped'), { ...report(), coordinates: point }))
  for (const db of [env.unauthenticatedContext().firestore(), signedIn('ben'), signedIn('inactive-staff')]) {
    await assertFails(getDoc(doc(db, 'floodReports', 'mapped')))
    await assertFails(getDocs(collection(db, 'floodReports')))
    await assertFails(setDoc(doc(db, 'floodReports', 'forged'), { ...report(), coordinates: point }))
  }
  for (const db of [ana, staff]) await assertFails(updateDoc(doc(db, 'floodReports', 'mapped'), { coordinates: { ...point, latitude: 15 }, updatedAt: serverTimestamp() }))
  await assertSucceeds(updateDoc(doc(staff, 'floodReports', 'mapped'), { status: 'Verified', updatedAt: serverTimestamp() }))
  assert.deepEqual((await getDoc(doc(ana, 'floodReports', 'mapped'))).data().coordinates, point)
  assert.equal((await assertSucceeds(getDocs(collection(staff, 'floodReports')))).size, 2)
})
